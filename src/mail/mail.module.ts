// src/mail/mail.module.ts
import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";

import { MailService } from "./mail.service";
import { MailController } from "./mail.controller";

@Module({
    imports: [ConfigModule], // para leer variables de entorno
    providers: [MailService],
    controllers: [MailController],
})
export class MailModule {}
