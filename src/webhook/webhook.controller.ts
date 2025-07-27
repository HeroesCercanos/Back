// src/webhook/webhook.controller.ts
import { Controller, Post, Req, HttpCode, Logger } from "@nestjs/common";
import { DonationService } from "src/donations/donations.service";
import { MailService } from "src/mail/mail.service";
import { MercadoPagoConfig, Payment } from "mercadopago";
import { ConfigService } from "@nestjs/config";
import { Donation } from "src/donations/entity/donation.entity"; // ¡Importante: asegúrate de que esta ruta sea correcta!

@Controller("webhooks/mercadopago")
export class WebhookController {
    private readonly logger = new Logger(WebhookController.name);
    private client: MercadoPagoConfig;
    private paymentClient: Payment;

    constructor(
        private readonly donationService: DonationService,
        private readonly mailService: MailService,
        private readonly config: ConfigService,
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

        // Solo procesamos notificaciones de tipo 'payment'
        if (body.type === "payment") {
            const paymentId = body.data.id as string;
            if (!paymentId) {
                this.logger.error("Webhook de pago sin ID de pago en body.data.id.");
                return;
            }

            this.logger.log(`Consultando detalles del pago ${paymentId} en Mercado Pago...`);

            try {
                // Consultar el estado real del pago usando el Payment ID
                const paymentDetails = await this.paymentClient.get({
                    id: paymentId,
                });

                // Inicializamos 'donation' como un tipo que puede ser Donation o null
                let donation: Donation | null = null;

                // --- Lógica de Búsqueda de la Donación en Cascada ---
                // Intentamos encontrar la donación usando los identificadores más fiables:

                // 1. Intentar con external_reference
                const externalReference = (paymentDetails as any).external_reference;
                if (externalReference) {
                    this.logger.log(`Intentando buscar donación por externalReference=${externalReference}`);
                    donation = await this.donationService.findByExternalReference(externalReference);
                }

                // 2. Si no se encontró por external_reference, intentar con preference_id
                if (!donation) {
                    const preferenceId = (paymentDetails as any).preference_id;
                    if (preferenceId) {
                        this.logger.log(`Intentando buscar donación por preferenceId=${preferenceId}`);
                        donation = await this.donationService.findByPreferenceId(preferenceId);
                    }
                }

                // 3. Si aún no se encontró, intentar con el ID del ítem (que debería ser el ID de tu donación)
                if (!donation && paymentDetails.additional_info && paymentDetails.additional_info.items && paymentDetails.additional_info.items.length > 0) {
                    const itemIdFromPayment = paymentDetails.additional_info.items[0].id;
                    if (itemIdFromPayment) {
                        // Si el ID del ítem tiene el prefijo 'don-', lo removemos para obtener el ID real de la donación
                        const donationIdFromItem = itemIdFromPayment.startsWith('don-') ? itemIdFromPayment.substring(4) : itemIdFromPayment;
                        this.logger.log(`Intentando buscar donación por ID de ítem: ${donationIdFromItem}`);
                        // Reutilizamos findByExternalReference ya que el ID de ítem es el ID de tu donación
                        donation = await this.donationService.findByExternalReference(donationIdFromItem);
                    }
                }
                // --- Fin Lógica de Búsqueda en Cascada ---

                this.logger.log(
                    `Detalles del pago ${paymentId}: Status=${paymentDetails.status}, ExternalReference=${externalReference || 'N/A'}, PreferenceId=${(paymentDetails as any).preference_id || 'N/A'}`,
                );

                // Solo procesar si el pago está APROBADO Y se encontró una donación vinculada
                if (paymentDetails.status === "approved") {
                    if (!donation) {
                        this.logger.error(
                            `Pago ${paymentId} aprobado, pero NO se encontró una donación vinculada con ningún identificador.`,
                        );
                        return; // Salir si no se encontró la donación
                    }

                    // Verificamos que el usuario asociado exista, si tu entidad lo permite ser null
                    // (Tu entidad Donation.user no es opcional, así que esto es una seguridad extra, pero útil)
                    if (!donation.user) {
                        this.logger.error(`Donación ${donation.id} encontrada, pero el usuario asociado es nulo o no se cargó.`);
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
                    } catch (err: any) {
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
