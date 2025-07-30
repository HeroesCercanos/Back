import { Injectable } from "@nestjs/common";
import * as nodemailer from "nodemailer";
import { EmailTemplate } from "../entities/email-template.entity";

@Injectable()
export class EmailService {
    private transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
            user: process.env.MAIL_USER,
            pass: process.env.MAIL_PASS,
        },
    });

    async sendTemplate(template: EmailTemplate, to: string[]) {
        await this.transporter.sendMail({
            from: `"Héroes Cercanos" <${process.env.MAIL_USER}>`,
            to: to.join(","),
            subject: template.subject,
            html: template.htmlContent,
        });
    }
}
