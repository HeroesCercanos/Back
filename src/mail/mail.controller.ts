// src/mail/mail.controller.ts
import {
    Controller,
    Post,
    Body,
    HttpException,
    HttpStatus,
} from "@nestjs/common";

import { MailService } from "./mail.service";
import { RegistrationEmailDto } from    "./dto/registration-email.dto";
import { DonationEmailDto } from "./dto/donation-email.dto";
import { IncidentEmailDto } from "./dto/incident-email.dto";

@Controller("api")
export class MailController {
    constructor(private readonly mailService: MailService) {}

    @Post("send-registration-email")
    async sendRegistration(@Body() dto: RegistrationEmailDto) {
        try {
            await this.mailService.sendRegistrationEmail(dto);
            return { success: true };
        } catch (err) {
            throw new HttpException(
                "Error enviando email de registro",
                HttpStatus.INTERNAL_SERVER_ERROR,
            );
        }
    }

    @Post("send-donation-email")
    async sendDonation(@Body() dto: DonationEmailDto) {
        try {
            await this.mailService.sendDonationEmail(dto);
            return { success: true };
        } catch (err) {
            throw new HttpException(
                "Error enviando email de donación",
                HttpStatus.INTERNAL_SERVER_ERROR,
            );
        }
    }

    @Post("send-incident-email")
    async sendIncident(@Body() dto: IncidentEmailDto) {
        try {
            await this.mailService.sendIncidentEmail(dto);
            return { success: true };
        } catch (err) {
            throw new HttpException(
                "Error enviando email de incidente",
                HttpStatus.INTERNAL_SERVER_ERROR,
            );
        }
    }
}
