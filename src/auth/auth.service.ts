// src/auth/auth.service.ts
import {
    BadRequestException,
    Injectable,
    UnauthorizedException,
} from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import * as bcrypt from "bcrypt";
import { UserService } from "src/user/user.service";
import { CreateUserDto } from "./dto/create-user.dto";

@Injectable()
export class AuthService {
    constructor(
        private readonly usersService: UserService,
        private readonly jwtService: JwtService,
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
            email: user.email,
            role: user.role,
        };

        // 4) Firmar y devolver
        return { access_token: this.jwtService.sign(payload) };
    }

    /** Registro de usuario + devolución de JWT */
    async signUp(dto: CreateUserDto) {
        // 1) Verifico que no exista otro usuario con ese email
        const dbUser = await this.usersService.findByEmail(dto.email);
        if (dbUser) {
            throw new BadRequestException("El email ya está en uso");
        }

        // 2) Hasheo la contraseña
        const hashedPassword = await bcrypt.hash(dto.password, 10);

        // 3) Creo el usuario en la BD (role por defecto USER)
        const user = await this.usersService.create({
            email: dto.email,
            password: hashedPassword,
            name: dto.name,
            role: dto.role,
        });

        // 4) Firmo y devuelvo el JWT
        const payload = { sub: user.id, email: user.email, role: user.role };
        return {
            access_token: this.jwtService.sign(payload),
        };
    }
}
