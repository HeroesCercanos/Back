// src/webhook/webhook.controller.ts
import { Controller, Post, Req, HttpCode, Logger } from "@nestjs/common";
import { DonationService } from "src/donations/donations.service"; 
import { MailService } from "src/mail/mail.service";

@Controller("webhooks/mercadopago")
export class WebhookController {
    private readonly logger = new Logger(WebhookController.name);

    constructor(
        private readonly donationService: DonationService,
        private readonly mailService: MailService,
    ) {}

    @Post()
    @HttpCode(200)
    async handle(@Req() req: any) {
        const body = req.body;
        this.logger.log(`Webhook recibido: ${JSON.stringify(body)}`);

        if (body.type === "payment" && body.data.status === "approved") {
            const prefId = body.data.preference_id as string;
            if (!prefId) {
                this.logger.error("Webhook sin preference_id");
                return;
            }

            this.logger.log(`Buscando donación con preferenceId=${prefId}`);
            const donation =
                await this.donationService.findByPreferenceId(prefId);
            if (!donation) {
                this.logger.warn(`No existe donación para prefId=${prefId}`);
                return;
            }

            if (donation.status !== "pending") {
                this.logger.log(
                    `Donación ${donation.id} ya procesada: ${donation.status}`,
                );
                return;
            }

            this.logger.log(`Marcando donación ${donation.id} como completed`);
            await this.donationService.markAsCompleted(donation.id);

            this.logger.log(`Enviando mail a ${donation.user.email}`);
            try {
                await this.mailService.sendDonationEmail({
                    name: donation.user.name,
                    email: donation.user.email,
                    amount: donation.amount,
                });
                this.logger.log(`Mail enviado correctamente`);
            } catch (err) {
                this.logger.error(
                    `Error enviando mail: ${err.message}`,
                    err.stack,
                );
            }
        }
    }
}
