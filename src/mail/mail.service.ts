// src/mail/mail.service.ts
import { Injectable } from "@nestjs/common";
import * as nodemailer from "nodemailer";

@Injectable()
export class MailService {
    private transporter = nodemailer.createTransport({
        service: "gmail", // o 'hotmail', 'outlook', etc.
        auth: {
            user: process.env.MAIL_USER,
            pass: process.env.MAIL_PASS,
        },
    });

    async sendMail(to: string, subject: string, text: string, html?: string) {
        return this.transporter.sendMail({
            from: `"Heroes Cercanos" <${process.env.MAIL_USER}>`,
            to,
            subject,
            text,
            html,
        });
    }
}
