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
            port: this.config.get<number>("MAIL_PORT"),
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
    from: `"Héroes Cercanos" <${this.config.get("MAIL_FROM")}>`,
    to: email,
    subject: `🎉 ¡Bienvenido, ${name}!`,
    html: `
  <div style="font-family: Arial, sans-serif; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
    <h2 style="color: #d32f2f; text-align: center;">¡Hola ${name}, bienvenido a Héroes Cercanos!</h2>

    <p style="color: #333;">Gracias por registrarte en nuestra plataforma solidaria.</p>

    <p style="color: #333;">
      En nuestra plataforma vas a poder colaborar con los cuarteles de bomberos voluntarios de distintas maneras:
    </p>

    <ul style="padding-left: 0; list-style: none; font-size: 15px; line-height: 1.6; color: #333;">
      <li>🚒 <strong style="color: #333;">Donaciones:</strong> contribuí económicamente para apoyar a los cuarteles.</li>
      <li>📍 <strong style="color: #333;">Reportes de incidentes:</strong> usá la geolocalización o el botón de llamada directa para alertar sobre emergencias.</li>
      <li>🎯 <strong style="color: #333;">Campañas específicas:</strong> participá en iniciativas puntuales de ayuda solidaria.</li>
      <li>📚 <strong style="color: #333;">Capacitaciones:</strong> accedé a contenido educativo pensado para la comunidad.</li>
    </ul>

    <hr style="margin: 30px 0;" />

    <div style="text-align: center; margin-top: 30px;">
      <img
        src="https://res.cloudinary.com/dnrckklsr/image/upload/v1753285490/glmavqyfzoeswr5kwknl.jpg"
        alt="Héroes Cercanos"
        style="max-width: 70px; height: auto; margin-bottom: 10px; opacity: 0.95;"
      />

      <footer style="font-size: 13px; color: #333;">
        Este mensaje fue enviado automáticamente por <strong style="color: #333;">Héroes Cercanos</strong>.<br/>
        <em style="color: #333;">Doná. Ayudá. Salvá.</em>
      </footer>
    </div>
  </div>
`

  });

  this.logger.log(`Registration email sent: ${info.messageId}`);
}

async sendDonationEmail(dto: DonationEmailDto) {
  const { name, email, amount } = dto;

  try {
    const adminMail = await this.transporter.sendMail({
      from: `"Héroes Cercanos" <${this.config.get("MAIL_FROM")}>`,
      to: this.config.get("ADMIN_EMAIL"),
      subject: `💰 Nueva donación recibida`,
      html: `
  <div style="font-family: Arial, sans-serif; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
    <h2 style="color: #1976d2; text-align: center;">🎉 ¡Nueva donación recibida!</h2>

    <p style="color: #333;"><strong style="color: #333;">Donante:</strong> ${name}</p>
    <p style="color: #333;"><strong style="color: #333;">Email:</strong> ${email}</p>
    <p style="color: #333;"><strong style="color: #333;">Monto:</strong> $${amount}</p>

    <hr style="margin: 30px 0;" />

    <div style="text-align: center; margin-top: 30px;">
      <img
        src="https://res.cloudinary.com/dnrckklsr/image/upload/v1753285490/glmavqyfzoeswr5kwknl.jpg"
        alt="Héroes Cercanos"
        style="max-width: 70px; height: auto; margin-bottom: 10px; opacity: 0.95;"
      />

      <footer style="font-size: 13px; color: #333;">
        Este mensaje fue generado automáticamente por la plataforma <strong style="color: #333;">Héroes Cercanos</strong>.<br/>
        <em style="color: #333;">Doná. Ayudá. Salvá.</em>
      </footer>
    </div>
  </div>
`

    });

    const userMail = await this.transporter.sendMail({
  from: `"Héroes Cercanos" <${this.config.get("MAIL_FROM")}>`,
  to: email,
  subject: `✅ ¡Gracias por tu donación!`,
  html: `
  <div style="font-family: Arial, sans-serif; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
    <h2 style="color: #d32f2f; text-align: center;">¡Gracias por tu aporte, ${name}!</h2>

    <p style="color: #333;">Tu donación de <strong style="color: #333;">$${amount}</strong> fue recibida con éxito y ya está ayudando a fortalecer el trabajo de nuestros bomberos voluntarios.</p>

    <p style="color: #333;">Gracias a personas como vos, podemos responder más rápido ante emergencias, equipar a los cuarteles y seguir cuidando nuestras comunidades.</p>

    <p style="color: #333;">¡Gracias por ser parte de esta red solidaria!</p>

    <hr style="margin: 30px 0;" />

    <div style="text-align: center; margin-top: 30px;">
      <img
        src="https://res.cloudinary.com/dnrckklsr/image/upload/v1753285490/glmavqyfzoeswr5kwknl.jpg"
        alt="Héroes Cercanos"
        style="max-width: 70px; height: auto; margin-bottom: 10px; opacity: 0.95;"
      />

      <footer style="font-size: 13px; color: #333;">
        Este mensaje fue enviado automáticamente por la plataforma <strong style="color: #333;">Héroes Cercanos</strong>.<br/>
        <em style="color: #333;">Doná. Ayudá. Salvá.</em>
      </footer>
    </div>
  </div>
`

});


    this.logger.log(`Donation email sent to admin: ${adminMail.messageId}`);
    this.logger.log(`Donation email sent to user: ${userMail.messageId}`);

    return { admin: adminMail, user: userMail };
  } catch (error) {
    console.error("Error interno en sendDonationEmail:", error);
    throw error;
  }
}

async sendIncidentEmail(dto: IncidentEmailDto) {
  const { name, email, type, location } = dto;

  try {
    const adminMail = await this.transporter.sendMail({
      from: `"Héroes Cercanos" <${this.config.get("MAIL_FROM")}>`,
      to: this.config.get("ADMIN_EMAIL"),
      subject: `📍 Nuevo incidente reportado: ${type}`,
      html: `
  <div style="font-family: Arial, sans-serif; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
    <h2 style="color: #d32f2f; text-align: center;">🔔 Se ha reportado un incidente</h2>

    <p style="color: #333;"><strong style="color: #333;">Tipo de incidente:</strong> ${type}</p>
    <p style="color: #333;"><strong style="color: #333;">Ubicación:</strong> ${location}</p>
    <p style="color: #333;"><strong style="color: #333;">Reportado por:</strong> ${name} (${email})</p>

    <hr style="margin: 30px 0;" />

    <div style="text-align: center; margin-top: 30px;">
      <img
        src="https://res.cloudinary.com/dnrckklsr/image/upload/v1753285490/glmavqyfzoeswr5kwknl.jpg"
        alt="Héroes Cercanos"
        style="max-width: 70px; height: auto; margin-bottom: 10px; opacity: 0.95;"
      />

      <footer style="font-size: 13px; color: #333;">
        Este mensaje fue generado automáticamente por la plataforma <strong style="color: #333;">Héroes Cercanos</strong>.
      </footer>
    </div>
  </div>
`

    });

    const userMail = await this.transporter.sendMail({
  from: `"Héroes Cercanos" <${this.config.get("MAIL_FROM")}>`,
  to: email,
  subject: `✅ Recibimos tu reporte de incidente`,
  html: `
  <div style="font-family: Arial, sans-serif; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
    <h2 style="color: #2e7d32; text-align: center;">¡Gracias por tu colaboración, ${name}!</h2>

    <p style="color: #333;">Recibimos tu reporte de <strong style="color: #333;">${type}</strong> en la ubicación:</p>
    <p style="color: #333;"><em style="color: #333;">${location}</em></p>

    <p style="color: #333;">Nuestro equipo ya lo tiene registrado y está evaluando la situación para tomar acción lo antes posible.</p>

    <p style="color: #333;">Gracias por actuar con responsabilidad y ayudarnos a cuidar a tu comunidad.</p>

    <hr style="margin: 30px 0;" />

    <div style="text-align: center; margin-top: 30px;">
      <img
        src="https://res.cloudinary.com/dnrckklsr/image/upload/v1753285490/glmavqyfzoeswr5kwknl.jpg"
        alt="Héroes Cercanos"
        style="max-width: 70px; height: auto; margin-bottom: 10px; opacity: 0.95;"
      />

      <footer style="font-size: 13px; color: #333;">
        Este mensaje fue enviado automáticamente por <strong style="color: #333;">Héroes Cercanos</strong>.<br/>
        <em style="color: #333;">Doná. Ayudá. Salvá.</em>
      </footer>
    </div>
  </div>
`

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