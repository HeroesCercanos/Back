// src/bans/ban.service.ts
import { Injectable, NotFoundException } from "@nestjs/common";
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
    async banUser(
    userId: string,
    manual = false,
    reason?: string,
  ): Promise<Ban> {
    // 1) Cargo el usuario y su banCount
    const user = await this.userRepo.findOne({ where: { id: userId } });
    if (!user) throw new NotFoundException('Usuario no encontrado');

    const prevCount = user.banCount || 0;
    const newCount = prevCount + 1;

    // 2) Duración según newCount
    let days: number;
    if (newCount === 1) days = 1;
    else if (newCount === 2) days = 5;
    else days = 30;

    const expiresAt = new Date(Date.now() + days * 24 * 60 * 60 * 1000);

    // 3) Creo el Ban
    const ban = this.banRepo.create({ user, expiresAt, manual });
    await this.banRepo.save(ban);

    // 4) Actualizo el user con el nuevo count y lo desactivo
    user.banCount = newCount;
    user.isActive = false;
    await this.userRepo.save(user);

    // 5) Armo el ordinal en español
    const ordinals = [
      'primera', 'segunda', 'tercera',
      'cuarta', 'quinta', 'sexta', 'séptima'
    ];
    const ordinal =
      newCount <= ordinals.length
        ? ordinals[newCount - 1]
        : `${newCount}ª`;

    // 6) Envío el mail de baneo con motivo si existe
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
