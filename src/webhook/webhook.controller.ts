// src/webhook/webhook.controller.ts
import { Controller, Post, Req, HttpCode, Logger } from "@nestjs/common";
import { DonationService } from "src/donations/donations.service";
import { MailService } from "src/mail/mail.service";
import { MercadoPagoConfig, Payment } from "mercadopago";
import { ConfigService } from "@nestjs/config"; // Asegúrate de importar ConfigService

@Controller("webhooks/mercadopago")
export class WebhookController {
    private readonly logger = new Logger(WebhookController.name);
    private client: MercadoPagoConfig;
    private paymentClient: Payment;

    constructor(
        private readonly donationService: DonationService,
        private readonly mailService: MailService,
        private readonly config: ConfigService, // Asegúrate de que esté inyectado
    ) {
        this.client = new MercadoPagoConfig({
            accessToken: this.config.get<string>("MERCADOPAGO_ACCESS_TOKEN")!,
        });
        this.paymentClient = new Payment(this.client);
    }

    @Post()
    @HttpCode(200)
    async handle(@Req() req: any) {
        const body = req.body;
        this.logger.log(`Webhook recibido: ${JSON.stringify(body)}`);

        // Solo nos interesa el tipo 'payment'
        if (body.type === "payment") {
            const paymentId = body.data.id as string;
            if (!paymentId) {
                this.logger.error(
                    "Webhook de pago sin ID de pago en body.data.id.",
                );
                return;
            }

            this.logger.log(
                `Consultando detalles del pago ${paymentId} en Mercado Pago...`,
            );

            try {
                // Consultar el estado real del pago usando el Payment ID
                const paymentDetails = await this.paymentClient.get({
                    id: paymentId,
                });

                // Usar aserción de tipo para preference_id
                const preferenceId = (paymentDetails as any).preference_id;

                this.logger.log(
                    `Detalles del pago ${paymentId}: Status=${paymentDetails.status}, PreferenceId=${preferenceId}`,
                );

                // Solo procesar si el pago está aprobado
                if (paymentDetails.status === "approved") {
                    if (!preferenceId) {
                        this.logger.error(
                            `Pago ${paymentId} aprobado, pero sin preference_id.`,
                        );
                        return;
                    }

                    this.logger.log(
                        `Buscando donación con preferenceId=${preferenceId}`,
                    );
                    const donation =
                        await this.donationService.findByPreferenceId(
                            preferenceId,
                        );

                    if (!donation) {
                        this.logger.warn(
                            `No existe donación para preferenceId=${preferenceId}.`,
                        );
                        return;
                    }

                    if (donation.status === "completed") {
                        this.logger.log(
                            `Donación ${donation.id} ya estaba en estado 'completed'. Ignorando.`,
                        );
                        return;
                    }

                    this.logger.log(
                        `Marcando donación ${donation.id} como 'completed'.`,
                    );
                    await this.donationService.markAsCompleted(donation.id);

                    this.logger.log(
                        `Intentando enviar mail a ${donation.user.email} para donación ${donation.id}.`,
                    );
                    try {
                        await this.mailService.sendDonationEmail({
                            name: donation.user.name,
                            email: donation.user.email,
                            amount: donation.amount,
                        });
                        this.logger.log(
                            `Mail de donación ${donation.id} enviado correctamente.`,
                        );
                    } catch (err) {
                        this.logger.error(
                            `Error enviando mail para donación ${donation.id}: ${err.message}`,
                            err.stack,
                        );
                    }
                } else {
                    this.logger.log(
                        `Pago ${paymentId} no aprobado (status: ${paymentDetails.status}). No se envía mail.`,
                    );
                }
            } catch (apiError: any) {
                // Capturar el error con tipo any
                this.logger.error(
                    `Error al consultar detalles del pago ${paymentId} en Mercado Pago: ${apiError.message}`,
                    apiError.stack,
                );
            }
        } else {
            this.logger.log(
                `Webhook de tipo ${body.type} no procesado por este controlador.`,
            );
        }
    }
}

/* // src/webhook/webhook.controller.ts
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
} */
