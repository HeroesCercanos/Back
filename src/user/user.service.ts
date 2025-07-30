import { Injectable, Logger, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { User } from "./entity/user.entity"; // ajustá ruta si necesario
import * as bcrypt from "bcrypt";

@Injectable()
export class UserService {
    private readonly logger = new Logger(UserService.name);
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

    async findById(id: string): Promise<User | null> {
        return this.userRepository.findOne({ where: { id } });
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
        const user = await this.userRepository.findOne({
            where: { id: userId },
        });
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
        const user = await this.userRepository.findOne({
            where: { id: userId },
        });
        if (!user) throw new NotFoundException("Usuario no encontrado");
        user.password = await bcrypt.hash(newPassword, 10);
        user.resetToken = null;
        user.resetTokenExpires = null;
        await this.userRepository.save(user);
    }

    async getTotalUsers(): Promise<number> {
        return this.userRepository.count();
    }

    /**
     * Obtiene el conteo de altas de usuarios por día para los últimos N días.
     * @param nDays Número de días hacia atrás a considerar (por defecto 7).
     * @returns Un array de objetos { date: string, count: number }.
     */
    async getUserRegistrationsLastNDays(
        nDays: number = 7,
    ): Promise<{ date: string; count: number }[]> {
        if (nDays <= 0) {
            this.logger.warn(
                `Valor de 'nDays' inválido: ${nDays}. Usando 7 por defecto.`,
            );
            nDays = 7;
        }

        // Consulta para PostgreSQL. Ajustar para otras DBs si es necesario.
        const result = await this.userRepository
            .createQueryBuilder("user")
            .select("TO_CHAR(user.createdAt, 'YYYY-MM-DD')", "date")
            .addSelect("COUNT(user.id)", "count")
            .where(`user.createdAt >= NOW() - INTERVAL '${nDays} days'`)
            .groupBy("date")
            .orderBy("date", "ASC")
            .getRawMany<{ date: string; count: string }>();

        // Mapear resultados a un Map para un acceso fácil
        const datesMap = new Map<string, number>();
        result.forEach((row) =>
            datesMap.set(row.date, parseInt(row.count, 10)),
        );

        // Rellenar los días faltantes con 0 para un rango completo
        const today = new Date();
        const lastNDaysData: { date: string; count: number }[] = [];
        for (let i = nDays - 1; i >= 0; i--) {
            const date = new Date(today);
            date.setDate(today.getDate() - i);
            const formattedDate = date.toISOString().split("T")[0]; // YYYY-MM-DD
            const count = datesMap.get(formattedDate) || 0;
            lastNDaysData.push({ date: formattedDate, count });
        }
        return lastNDaysData;
    }

    /**
     * Obtiene el conteo de altas de usuarios por mes para los últimos N meses.
     * @param nMonths Número de meses hacia atrás a considerar (por defecto 6).
     * @returns Un array de objetos { month: string, count: number }.
     */
    async getUserRegistrationsLastNMonths(
        nMonths: number = 6,
    ): Promise<{ month: string; count: number }[]> {
        if (nMonths <= 0) {
            this.logger.warn(
                `Valor de 'nMonths' inválido: ${nMonths}. Usando 6 por defecto.`,
            );
            nMonths = 6;
        }

        // Consulta para PostgreSQL. Ajustar para otras DBs si es necesario.
        const result = await this.userRepository
            .createQueryBuilder("user")
            .select("TO_CHAR(user.createdAt, 'YYYY-MM')", "month")
            .addSelect("COUNT(user.id)", "count")
            .where(`user.createdAt >= NOW() - INTERVAL '${nMonths} months'`)
            .groupBy("month")
            .orderBy("month", "ASC")
            .getRawMany<{ month: string; count: string }>();

        // Mapear resultados a un Map
        const monthsMap = new Map<string, number>();
        result.forEach((row) =>
            monthsMap.set(row.month, parseInt(row.count, 10)),
        );

        // Rellenar los meses faltantes con 0
        const today = new Date();
        const lastNMonthsData: { month: string; count: number }[] = [];
        for (let i = nMonths - 1; i >= 0; i--) {
            const date = new Date(today.getFullYear(), today.getMonth() - i, 1);
            const formattedMonth = date.toISOString().substring(0, 7); // YYYY-MM
            const count = monthsMap.get(formattedMonth) || 0;
            lastNMonthsData.push({ month: formattedMonth, count });
        }
        return lastNMonthsData;
    }

    /**
     * Obtiene el conteo de altas de usuarios por mes para todo el historial.
     * @returns Un array de objetos { month: string, count: number }.
     */
    async getAllUserRegistrationsMonthly(): Promise<
        { month: string; count: number }[]
    > {
        // Consulta para PostgreSQL. Ajustar para otras DBs si es necesario.
        const result = await this.userRepository
            .createQueryBuilder("user")
            .select("TO_CHAR(user.createdAt, 'YYYY-MM')", "month")
            .addSelect("COUNT(user.id)", "count")
            .groupBy("month")
            .orderBy("month", "ASC")
            .getRawMany<{ month: string; count: string }>();

        return result.map((row) => ({
            month: row.month,
            count: parseInt(row.count, 10),
        }));
    }

    async changePassword(userId: string, newPassword: string) {
        const user = await this.userRepository.findOneBy({ id: userId });
        if (!user) throw new NotFoundException("Usuario no encontrado");

        const hash = await bcrypt.hash(newPassword, 10);
        user.password = hash;
        await this.userRepository.save(user);
    }
}
