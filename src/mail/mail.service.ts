// src/mail/mail.service.ts
import { Injectable, Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import * as nodemailer from "nodemailer";
import { RegistrationEmailDto } from "./dto/registration-email.dto";
import { DonationEmailDto } from "./dto/donation-email.dto";
import { IncidentEmailDto } from "./dto/incident-email.dto";

@Injectable()
export class MailService {
    private transporter;
    private readonly logger = new Logger(MailService.name);

    constructor(private config: ConfigService) {
        this.transporter = nodemailer.createTransport({
            host: this.config.get("MAIL_HOST"),
            //port: this.config.get<number>("MAIL_PORT"),
            //secure: this.config.get<boolean>("MAIL_SECURE"), // true si usas 465
            secure: false, // ← ⚠️ fijamos directamente false
        requireTLS: true, // ← ✅ esto fuerza STARTTLS
            auth: {
                user: this.config.get("MAIL_USER"),
                pass: this.config.get("MAIL_PASS"),
            },
        });
    }

    async sendRegistrationEmail(dto: RegistrationEmailDto) {
        const { name, email } = dto;
        const info = await this.transporter.sendMail({
            from: `"Mi App" <${this.config.get("MAIL_FROM")}>`,
            to: email,
            subject: `Bienvenido, ${name}!`,
            html: `<p>Hola ${name},</p>
             <p>¡Gracias por registrarte en nuestra plataforma!</p>`,
        });
        this.logger.log(`Registration email sent: ${info.messageId}`);
    }

    async sendDonationEmail(dto: DonationEmailDto) {
        const { name, email, amount } = dto;
        const info = await this.transporter.sendMail({
            from: `"Mi App" <${this.config.get("MAIL_FROM")}>`,
            to: email,
            subject: `Donación recibida: $${amount}`,
            html: `<p>Hola ${name},</p>
             <p>Hemos recibido tu donación de <b>$${amount}</b>. ¡Muchas gracias!</p>`,
        });
        this.logger.log(`Donation email sent: ${info.messageId}`);
    }

    async sendIncidentEmail(dto: IncidentEmailDto) {
    const { name, email, type, location } = dto;

    try {
        const info = await this.transporter.sendMail({
            from: `"Mi App" <${this.config.get("MAIL_FROM")}>`,
            to: [this.config.get("ADMIN_EMAIL"), email],
            subject: `Nuevo incidente: ${type}`,
            html: `<p>Reporte de <b>${type}</b> en ${location}.</p>
                   <p>Usuario: ${name} (${email})</p>`,
        });
        this.logger.log(`Incident email sent: ${info.messageId}`);
        return info;
    } catch (error) {
        console.error("Error interno en sendIncidentEmail:", error); // 👈 AGREGAR ESTO
        throw error;
    }
}

    /*async sendIncidentEmail(dto: IncidentEmailDto) {
        const { name, email, type, location } = dto;
        const info = await this.transporter.sendMail({
            from: `"Mi App" <${this.config.get("MAIL_FROM")}>`,
            to: this.config.get("ADMIN_EMAIL"), // o bien a dto.email si quieres notificar al usuario
            subject: `Nuevo incidente: ${type}`,
            html: `<p>Reporte de <b>${type}</b> en ${location}.</p>
             <p>Usuario: ${name} (${email})</p>`,
        });
        this.logger.log(`Incident email sent: ${info.messageId}`);
    }*/
}
