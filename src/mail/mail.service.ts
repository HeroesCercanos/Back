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
    // 📤 Mail para el administrador
    const adminMail = await this.transporter.sendMail({
      from: `"Héroes Cercanos" <${this.config.get("MAIL_FROM")}>`,
      to: this.config.get("ADMIN_EMAIL"),
      subject: `📍 Nuevo incidente reportado: ${type}`,
      html: `
        <div style="font-family: Arial, sans-serif; color: #333;">
          <h2 style="color: #d32f2f;">🔔 Se ha reportado un incidente</h2>
          <p><strong>Tipo de incidente:</strong> ${type}</p>
          <p><strong>Ubicación:</strong> ${location}</p>
          <p><strong>Reportado por:</strong> ${name} (${email})</p>
          <hr style="margin: 20px 0;" />
          <p style="font-size: 14px;">Mensaje generado automáticamente por la plataforma <strong>Héroes Cercanos</strong>.</p>
        </div>
      `,
    });

    // 📤 Mail para el usuario
    const userMail = await this.transporter.sendMail({
      from: `"Héroes Cercanos" <${this.config.get("MAIL_FROM")}>`,
      to: email,
      subject: `✅ Recibimos tu reporte de incidente`,
      html: `
        <div style="font-family: Arial, sans-serif; color: #333;">
          <h2 style="color: #2e7d32;">¡Gracias por tu colaboración, ${name}!</h2>
          <p>Tu reporte de <strong>${type}</strong> en la ubicación:</p>
          <p><em>${location}</em></p>
          <p>ha sido recibido correctamente por nuestro equipo.</p>
          <p>Nos pondremos en contacto en caso de ser necesario.</p>
          <hr style="margin: 20px 0;" />
          <p style="font-size: 14px;">Este mensaje fue enviado desde la plataforma <strong>Héroes Cercanos</strong>.</p>
        </div>
      `,
    });

    this.logger.log(`Incident email sent to admin: ${adminMail.messageId}`);
    this.logger.log(`Incident email sent to user: ${userMail.messageId}`);

    return { admin: adminMail, user: userMail };
  } catch (error) {
    console.error("Error interno en sendIncidentEmail:", error);
    throw error;
  }
}

    
}
