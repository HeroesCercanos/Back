// src/auth/auth.service.ts
import {
    BadRequestException,
    Injectable,
    NotFoundException,
    UnauthorizedException,
} from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import * as bcrypt from "bcrypt";
import { UserService } from "src/user/user.service";
import { CreateUserDto } from "./dto/create-user.dto";
import { User } from "src/user/entity/user.entity";
import { Role } from "src/user/role.enum";
import * as crypto from "crypto";
import { MailService } from "src/mail/mail.service";
import { ForgotPasswordDto } from "./dto/forgot-password.dto";
import { ResetPasswordEmailDto } from "./dto/reset-password-email.dto";
import { ResetPasswordDto } from "./dto/reset-password.dto";

@Injectable()
export class AuthService {
    constructor(
        private readonly usersService: UserService,
        private readonly jwtService: JwtService,
        private readonly mailService: MailService,
    ) {}

    /** Valida credenciales y firma JWT */
    async signIn(email: string, password: string) {
        // 1) Buscar usuario
        const user = await this.usersService.findByEmail(email);
        if (!user) throw new UnauthorizedException("Credenciales inválidas");

        // 2) Comparar password
        const valid = await bcrypt.compare(password, user.password);
        if (!valid) throw new UnauthorizedException("Credenciales inválidas");

        // 3) Construir payload con Role
        const payload = {
            sub: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
        };

        // 4) Firmo el JWT

        const access_token = this.jwtService.sign(payload);

        return {
            access_token: this.jwtService.sign(payload),
            // opcionalmente también devolvemos el user si lo necesitas
            user: {
                id: user.id,
                email: user.email,
                name: user.name,
                role: user.role,
            },
        };
    }

    /** Registro de usuario + devolución de JWT */
    /*    async signUp(dto: CreateUserDto) {
        // 1) Verifico que no exista otro usuario con ese email
        const dbUser = await this.usersService.findByEmail(dto.email);
        if (dbUser) {
            throw new BadRequestException("El email ya está en uso");
        }

        // 2) Hasheo la contraseña
        const { password, confirmPassword, ...rest } = dto;
        // (Opcional) por seguridad, doble chequeo
        if (password !== confirmPassword) {
            throw new BadRequestException("Las contraseñas no coinciden");
        }
        const hashedPassword = await bcrypt.hash(password, 10);

        // 3) Creo el usuario en la BD (role por defecto USER)
        const user = await this.usersService.create({
            ...rest, // email, name, etc.
            password: hashedPassword,
        });

        // 4) Firmo y devuelvo el JWT
        const payload = { sub: user.id, email: user.email, role: user.role };
        return {
            access_token: this.jwtService.sign(payload),
        };
    } */
    async signUp(dto: CreateUserDto) {
        // 1) Verifico que no exista otro usuario con ese email
        const dbUser = await this.usersService.findByEmail(dto.email);
        if (dbUser) {
            throw new BadRequestException("El email ya está en uso");
        }

        // 2) Hasheo la contraseña
        const { password, confirmPassword, ...rest } = dto;
        if (password !== confirmPassword) {
            throw new BadRequestException("Las contraseñas no coinciden");
        }
        const hashedPassword = await bcrypt.hash(password, 10);

        // 3) Creo el usuario en la BD
        const user = await this.usersService.create({
            ...rest, // name, email, etc.
            password: hashedPassword,
            role: Role.USER, // Por si querés forzarlo
        });

        // 4) No devuelvo token, solo confirmo creación
        return { message: "Usuario creado exitosamente", userId: user.id };
    }
    async validateGoogleLogin(profile: {
        googleId: string;
        email: string;
        name?: string;
        picture?: string;
    }) {
        // 1) Buscamos por googleId
        let user: User | null = await this.usersService.findByGoogleId(
            profile.googleId,
        );
        if (!user) {
            // 2) Si no existe, buscamos por email
            user = await this.usersService.findByEmail(profile.email);
        }

        if (!user) {
            // 3) Si tampoco existe, creamos nuevo
            user = await this.usersService.create({
                email: profile.email,
                name: profile.name || "Sin nombre",
                role: Role.USER,
                googleId: profile.googleId,
            });
        } else if (!user.googleId) {
            // 4) Si existe por email pero sin googleId, lo asociamos
            user = await this.usersService.update(user.id, {
                googleId: profile.googleId,
                picture: profile.picture,
            });
        }

        // 5) Retornamos JWT
        if (user) {
            return this.generateToken(user);
        } else {
            // handle the case where user is null
            throw new Error("User not found");
        }
    }

    private generateToken(user: User) {
        const payload = {
            sub: user.id,
            email: user.email,
            name: user.name,
            role: user.role,
        };
        const access_token = this.jwtService.sign(payload);

        return {
            access_token: this.jwtService.sign(payload),
            // opcionalmente también devolvemos el user si lo necesitas
            user: {
                id: user.id,
                email: user.email,
                name: user.name,
                role: user.role,
            },
        };
    }

    // 1) Solicitar recuperación
    async sendResetPasswordEmail(dto: ForgotPasswordDto): Promise<void> {
        const { email } = dto;
        const user = await this.usersService.findByEmail(email);
        if (!user) {
            // No revelamos si existe o no
            return;
        }

        // Generar token + expiración
        const token = crypto.randomUUID();
        const expires = new Date(Date.now() + 3600 * 1000); // +1h

        await this.usersService.saveResetToken(user.id, token, expires);

        // Instancio el DTO de mail para que TS acepte email + token
        const mailDto = new ResetPasswordEmailDto();
        mailDto.email = email;
        mailDto.token = token;

        await this.mailService.sendResetPassword(mailDto);
    }

    /**
     * 2️⃣ Valida token y actualiza la contraseña.
     */
    async resetPassword(dto: ResetPasswordDto): Promise<void> {
        const { token, newPassword, confirmPassword } = dto;

        if (newPassword !== confirmPassword) {
            throw new BadRequestException("Las contraseñas no coinciden.");
        }

        const user = await this.usersService.findByResetToken(token);
        if (!user) {
            throw new NotFoundException("Token inválido o expirado.");
        }

        await this.usersService.updatePassword(user.id, newPassword);
    }

    
}
