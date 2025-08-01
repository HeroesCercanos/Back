// src/mail/dto/ban-email.dto.ts
export class BanEmailDto {
  name: string;
  email: string;
  banCount: number;
  bannedUntil: Date;
}
