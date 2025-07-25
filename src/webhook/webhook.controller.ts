// src/webhook/webhook.controller.ts
import {
    Controller,
    Post,
    Req,
    HttpCode,
    BadRequestException,
} from "@nestjs/common";
import { DonationService } from "src/donations/donations.service"; 
import { MailService } from "src/mail/mail.service";

@Controller("webhooks/mercadopago")
export class WebhookController {
    constructor(
        private readonly donationService: DonationService,
        private readonly mailService: MailService,
    ) {}

    @Post()
    @HttpCode(200) // MP requiere 200 para no reintentar
    async handle(@Req() req: any) {
        const body = req.body;

        // Validamos el evento de pago aprobado
        if (body.type === "payment" && body.data.status === "approved") {
            const prefId = body.data.preference_id as string;
            if (!prefId) {
                throw new BadRequestException(
                    "Falta preference_id en el webhook",
                );
            }

            // Buscamos la donación junto con el usuario
            const donation =
                await this.donationService.findByPreferenceId(prefId);
            if (!donation) return; // no existe, no hacemos nada
            if (donation.status !== "pending") return; // ya procesada

            // 1) Marcamos como completada
            await this.donationService.markAsCompleted(donation.id);

            // 2) Enviamos los emails con los datos del user relacionado
            await this.mailService.sendDonationEmail({
                name: donation.user.name,
                email: donation.user.email,
                amount: donation.amount,
            });
        }
    }
}
