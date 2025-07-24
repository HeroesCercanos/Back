import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { User } from "./entity/user.entity"; // ajustá ruta si necesario
import bcrypt from "bcrypt";

@Injectable()
export class UserService {
    constructor(
        @InjectRepository(User)
        private userRepository: Repository<User>,
    ) {}
    // Devuelve todos los usuarios
    async findAll(): Promise<User[]> {
        return this.userRepository.find();
    }
    // Devuelve User | undefined en lugar de lanzar excepción
    async findByEmail(email: string): Promise<User | null> {
        return this.userRepository.findOne({ where: { email } });
    }

    async findByGoogleId(googleId: string): Promise<User | null> {
        return this.userRepository.findOne({ where: { googleId } });
    }

    async create(data: Partial<User>): Promise<User> {
        const user = this.userRepository.create(data);
        return this.userRepository.save(user);
    }

    async update(id: string, attrs: Partial<User>): Promise<User> {
        await this.userRepository.update(id, attrs);
        const user = await this.userRepository.findOne({ where: { id } });
        if (!user) {
            throw new Error(`User with id ${id} not found`);
        }
        return user;
    }
    async updateLocation(
        id: string,
        latitude: number,
        longitude: number,
    ): Promise<User> {
        return this.update(id, { latitude, longitude });
    }

    async remove(id: string): Promise<void> {
        const user = await this.userRepository.findOne({ where: { id } });
        if (!user) {
            throw new NotFoundException(`User with id ${id} not found`);
        }
        await this.userRepository.remove(user);
    }

    // Guardar token y expiración
    async saveResetToken(
        userId: string,
        token: string,
        expires: Date,
    ): Promise<void> {
        const user = await this.userRepository.findOne({ where: { id: userId } });
        if (!user) throw new NotFoundException("Usuario no encontrado");
        user.resetToken = token;
        user.resetTokenExpires = expires;
        await this.userRepository.save(user);
    }

    // Buscar por token y validar expiración
    async findByResetToken(token: string): Promise<User> {
        const user = await this.userRepository.findOne({
            where: { resetToken: token },
        });
        if (
            !user ||
            !user.resetTokenExpires ||
            user.resetTokenExpires < new Date()
        ) {
            throw new NotFoundException("Token inválido o expirado");
        }
        return user;
    }

    // Hash y actualizar password + limpiar token
    async updatePassword(userId: string, newPassword: string): Promise<void> {
        const user = await this.userRepository.findOne({ where: { id: userId } });
        if (!user) throw new NotFoundException("Usuario no encontrado");
        user.password = await bcrypt.hash(newPassword, 10);
        user.resetToken = null;
        user.resetTokenExpires = null;
        await this.userRepository.save(user);
    }
}
