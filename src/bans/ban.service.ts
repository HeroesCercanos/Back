// src/bans/ban.service.ts
import {
    Injectable,
    NotFoundException,
    BadRequestException,
} from "@nestjs/common";
import { MoreThan, Repository } from "typeorm";
import { Ban } from "./entity/ban.entity";
import { User } from "src/user/entity/user.entity";
import { InjectRepository } from "@nestjs/typeorm";
import { MailService } from "src/mail/mail.service";
import { BanEmailDto } from "src/mail/dto/ban-email.dto";
import { ReactivationEmailDto } from "src/mail/dto/reactivation-email.dto";

@Injectable()
export class BanService {
    constructor(
        @InjectRepository(Ban) private banRepo: Repository<Ban>,
        @InjectRepository(User) private userRepo: Repository<User>,
        private readonly mailService: MailService,
    ) {}

    /**
     * Crea un bloqueo o suspensión.
     * @param userId Id del usuario a bannear.
     * @param manual Si es por acción manual de admin.
     */
    async banUser(
        userId: string,
        manual = false,
        reason?: string,
    ): Promise<Ban> {
        const user = await this.userRepo.findOne({ where: { id: userId } });
        if (!user) throw new NotFoundException("Usuario no encontrado");

        const prevCount = user.banCount || 0;
        const newCount = prevCount + 1;

        // Duración según newCount
        let days: number;
        if (newCount === 1) days = 1;
        else if (newCount === 2) days = 5;
        else days = 30;

        const expiresAt = new Date(Date.now() + days * 24 * 60 * 60 * 1000);

        // Creo el Ban
        const ban = this.banRepo.create({ user, expiresAt, manual });
        await this.banRepo.save(ban);

        // Actualizo el user
        user.banCount = newCount;
        user.isActive = false;
        await this.userRepo.save(user);

        // Envío mail de baneo
        const ordinals = ["primera", "segunda", "tercera", "cuarta"];
        const ordinal =
            newCount <= ordinals.length
                ? ordinals[newCount - 1]
                : `${newCount}ª`;
        const dto: BanEmailDto = {
            name: user.name,
            email: user.email,
            banCount: newCount,
            bannedUntil: expiresAt,
            reason,
        };
        await this.mailService.sendBanEmail(dto, ordinal);

        return ban;
    }

    /**
     * Levanta el ban activo, marca reactivatedAt, reactiva la cuenta
     * y envía el mail de reactivación con la fecha de expiración anterior.
     */
    async reactivateUser(userId: string, manual = false): Promise<Ban> {
        // Cargo al usuario con todos sus bans
        const user = await this.userRepo.findOne({
            where: { id: userId },
            relations: ["bans"],
        });
        if (!user) throw new NotFoundException("Usuario no encontrado");

        // Busco el ban activo
        const now = new Date();
        const activeBan = user.bans.find(
            (b) => !b.reactivatedAt && b.expiresAt > now,
        );
        if (!activeBan) {
            throw new BadRequestException(
                "No hay un ban activo para este usuario",
            );
        }

        // Marco la reactivación en la tabla de bans
        activeBan.reactivatedAt = now;
        await this.banRepo.save(activeBan);

        // Reactivo la cuenta de usuario
        user.isActive = true;
        await this.userRepo.save(user);

        // Determino la fecha para el mail
        const effectiveDate = manual
            ? now // reactivación manual → hoy
            : activeBan.expiresAt; // automática → fecha de expiración original

        // Envío el mail
        const reactDto: ReactivationEmailDto = {
            name: user.name,
            email: user.email,
            effectiveExpirationDate: effectiveDate,
        };
        await this.mailService.sendReactivationEmail(reactDto);

        return activeBan;
    }

    /** ¿Está actualmente baneado? */
    async isBanned(userId: string): Promise<boolean> {
        const activeCount = await this.banRepo.count({
            where: { user: { id: userId }, expiresAt: MoreThan(new Date()) },
        });
        return activeCount > 0;
    }

    /** Historial completo de bans */
    async getBans(userId: string): Promise<Ban[]> {
        return this.banRepo.find({ where: { user: { id: userId } } });
    }

    /** Total de bans para un usuario */
    async countByUser(userId: string): Promise<number> {
        return this.banRepo.count({ where: { user: { id: userId } } });
    }
}
