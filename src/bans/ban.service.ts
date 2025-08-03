// src/bans/ban.service.ts
import { Injectable } from "@nestjs/common";
import { MoreThan, Repository } from "typeorm";
import { Ban } from "./entity/ban.entity";
import { User } from "src/user/entity/user.entity";
import { InjectRepository } from "@nestjs/typeorm";
import { MailService } from "src/mail/mail.service";
import { BanEmailDto } from "src/mail/dto/ban-email.dto";

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
    async banUser(userId: string, manual = false) {
        const user = await this.userRepo.findOneOrFail({
            where: { id: userId },
            relations: ["bans"],
        });

        const prevCount = user.bans.length;
        const days = prevCount === 0 ? 1 : prevCount === 1 ? 5 : 30;

        const now = new Date();
        const expiresAt = new Date(now.getTime() + days * 86400000);

        const ban = this.banRepo.create({ user, expiresAt, manual });
        await this.banRepo.save(ban);

        // → Incrementar banCount en User
        user.banCount = prevCount + 1;
        user.isActive = false; // desactivo al baneo
        await this.userRepo.save(user);

        // Enviar mail de baneo (ya recibe banCount actualizado)
        await this.mailService.sendBanEmail({
            name: user.name,
            email: user.email,
            banCount: user.banCount,
            bannedUntil: expiresAt,
        });

        return ban;
    }

    async isBanned(userId: string): Promise<boolean> {
        const active = await this.banRepo.count({
            where: { user: { id: userId }, expiresAt: MoreThan(new Date()) },
        });
        return active > 0;
    }

    async getBans(userId: string): Promise<Ban[]> {
        return this.banRepo.find({ where: { user: { id: userId } } });
    }
}
