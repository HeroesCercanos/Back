// src/mail/dto/reactivation-email.dto.ts
export class ReactivationEmailDto {
  name: string;
  email: string;
  previousBannedUntil: Date;
}