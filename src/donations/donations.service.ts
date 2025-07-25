// src/donation/donation.service.ts
import { BadRequestException, Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository, SelectQueryBuilder } from "typeorm";
import { Donation } from "./entity/donation.entity";
import { CreateDonationDto } from "./dto/create-donatio.dto.";
import { User } from "../user/entity/user.entity";
import { MercadoPagoConfig, Preference } from "mercadopago";

@Injectable()
export class DonationService {
    private client: MercadoPagoConfig;
    private preferenceClient: Preference;
    constructor(
        @InjectRepository(Donation)
        private readonly donationRepo: Repository<Donation>,
    ) {
        // 1. Inicializa MercadoPagoConfig con tu Access Token
        // Es crucial usar una variable de entorno para el accessToken en producción.
        this.client = new MercadoPagoConfig({
            accessToken:
                "APP_USR-1094579508369836-072109-eb42a568ae4d52e37fd94375d048accc-2574775518",
        });

        // 2. Ahora, inicializa el cliente de preferencias pasando la configuración
        this.preferenceClient = new Preference(this.client);
    }

    /** Crea una donación para un usuario */
    /*  async create(dto: CreateDonationDto, user: User): Promise<Donation> {
        const donation = this.donationRepo.create({ ...dto, user });
        return this.donationRepo.save(donation);
    } */

    /** Historial de donaciones de un usuario */
    async findByUser(user: User): Promise<Donation[]> {
        return this.donationRepo.find({
            where: { user: { id: user.id } },
            order: { createdAt: "DESC" },
        });
    }

    /** Suma total de todas las donaciones */
    async totalDonations(): Promise<number> {
        const result = await this.donationRepo
            .createQueryBuilder("donation")
            .select("SUM(donation.amount)", "sum")
            .getRawOne<{ sum: string }>();

        // result puede ser undefined, así que lo chequeamos:
        const sumStr = result?.sum ?? "0";
        return parseFloat(sumStr);
    }

    /** Historial mensual: [{ month: '2025-07', total: 123.45 }, …] */
    async monthlyDonations(): Promise<{ month: string; total: number }[]> {
        const qb = this.donationRepo
            .createQueryBuilder("donation")
            .select("TO_CHAR(donation.createdAt, 'YYYY-MM')", "month")
            .addSelect("SUM(donation.amount)", "total")
            .groupBy("month")
            .orderBy("month", "ASC");

        const rows = await qb.getRawMany<{ month: string; total: string }>();
        return rows.map((r) => ({
            month: r.month,
            total: parseFloat(r.total),
        }));
    }

    // 🎯 Crear preferencia para MercadoPago
    /* async createPreference(amount: number, description: string) {
        try {
            const result = await this.preferenceClient.create({ // ¡Usamos this.preferenceClient!
                body: { // La preferencia se crea con un 'body' que contiene los items y back_urls
                    items: [
                        {
                            id: 'item-id-1234',
                            title: description,
                            quantity: 1,
                            unit_price: amount,
                            currency_id: 'ARS',
                        },
                    ],
                    back_urls: {
                        success: 'https://heroes-cercanos-front.onrender.com/success',
                        failure: 'https://heroes-cercanos-front.onrender.com/failure',
                        pending: 'https://heroes-cercanos-front.onrender.com/pending',
                    },
                    auto_return: 'approved',
                }
            });

            // El resultado de create devuelve el cuerpo de la preferencia en .body
            return { id: result.id }; // Ahora el ID está directamente en result.id
        } catch (error) {
            console.error('Error al crear preferencia de Mercado Pago:', error);
            // Puedes lanzar una excepción de NestJS si quieres manejar errores en el controlador
            throw new Error('Error al crear preferencia de pago en Mercado Pago');
        }
    } */

    // src/donation/donation.service.ts
    async create(
        dto: CreateDonationDto,
        user: User,
    ): Promise<{
        donation: Donation;
        checkoutUrl: string;
        preferenceId: string;
    }> {
        // 1) Crear preferencia
        const pref = await this.preferenceClient.create({
            body: {
                items: [
                    {
                        id: `don-${Date.now()}`,
                        title: `Donación de ${user.name}`,
                        quantity: 1,
                        unit_price: dto.amount,
                        currency_id: "ARS",
                    },
                ],
                back_urls: {
                    success: process.env.MP_BACK_URL_SUCCESS!,
                    pending: process.env.MP_BACK_URL_PENDING!,
                    failure: process.env.MP_BACK_URL_FAILURE!,
                },
                auto_return: "approved",
            },
        });

        // 2) Extraer y validar
        const checkoutUrl = pref.init_point!;
        const preferenceId = pref.id;

        if (!checkoutUrl) {
            throw new BadRequestException(
                "No llegó el URL de pago de MercadoPago",
            );
        }

        if (!preferenceId) {
            throw new Error("No se recibió preference_id de MercadoPago");
        }

        // 3) Guardar en BD en estado "pending"
        const donation = this.donationRepo.create({
            user,
            amount: dto.amount,
            description: dto.description ?? "", // ← aquí
            preferenceId,
            status: "pending",
        });
        await this.donationRepo.save(donation);

        return { donation, checkoutUrl, preferenceId };
    }

    async findByPreferenceId(prefId: string): Promise<Donation | null> {
        return this.donationRepo.findOne({
            where: { preferenceId: prefId },
            relations: ["user"],
        });
    }

    async markAsCompleted(id: string): Promise<void> {
        await this.donationRepo.update(id, { status: "completed" });
    }
}
