// src/donation/donation.service.ts
import { BadRequestException, Injectable, Logger } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository, SelectQueryBuilder } from "typeorm";
import { Donation } from "./entity/donation.entity";
import { CreateDonationDto } from "./dto/create-donatio.dto.";
import { User } from "../user/entity/user.entity";
import { MercadoPagoConfig, Preference } from "mercadopago";
import { ConfigService } from "@nestjs/config";

@Injectable()
export class DonationService {
    private client: MercadoPagoConfig;
    private readonly logger = new Logger(DonationService.name);
    private preferenceClient: Preference;
    constructor(
        @InjectRepository(Donation)
        private readonly donationRepo: Repository<Donation>,
        private readonly config: ConfigService,
    ) {
        // 1. Inicializa MercadoPagoConfig con tu Access Token
        // Es crucial usar una variable de entorno para el accessToken en producción.
        this.client = new MercadoPagoConfig({
            accessToken: this.config.get<string>("MERCADOPAGO_ACCESS_TOKEN")!,
        });

        // 2. Ahora, inicializa el cliente de preferencias pasando la configuración
        this.preferenceClient = new Preference(this.client);
    }

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
            .where("donation.status = :status", { status: "completed" }) // Solo suma donaciones completadas
            .getRawOne<{ sum: string }>();

        const sumStr = result?.sum ?? "0";
        return parseFloat(sumStr);
    }

    async getAllMonthlyDonations(): Promise<
        { month: string; total: number }[]
    > {
        const qb = this.donationRepo
            .createQueryBuilder("donation")
            .select("TO_CHAR(donation.createdAt, 'YYYY-MM')", "month")
            .addSelect("SUM(donation.amount)", "total")
            .where("donation.status = :status", { status: "completed" }) // Solo donaciones completadas
            .groupBy("month")
            .orderBy("month", "ASC");

        const rows = await qb.getRawMany<{ month: string; total: string }>();
        return rows.map((r) => ({
            month: r.month,
            total: parseFloat(r.total),
        }));
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

    async getWeeklyDonationsLast7Days(): Promise<
        { date: string; total: number; count: number }[]
    > {
        const result = await this.donationRepo
            .createQueryBuilder("donation")
            .select("TO_CHAR(donation.createdAt, 'YYYY-MM-DD')", "date")
            .addSelect("SUM(donation.amount)", "total")
            .addSelect("COUNT(donation.id)", "count")
            .where("donation.createdAt >= NOW() - INTERVAL '7 days'")
            .andWhere("donation.status = :status", { status: "completed" })
            .groupBy("date")
            .orderBy("date", "ASC")
            .getRawMany<{ date: string; total: string; count: string }>();

        const today = new Date();
        const datesMap = new Map<string, { total: number; count: number }>();
        result.forEach((row) =>
            datesMap.set(row.date, {
                total: parseFloat(row.total),
                count: parseInt(row.count),
            }),
        );

        const last7DaysData: { date: string; total: number; count: number }[] =
            [];

        for (let i = 6; i >= 0; i--) {
            const date = new Date(today);
            date.setDate(today.getDate() - i);
            const formattedDate = date.toISOString().split("T")[0];
            const data = datesMap.get(formattedDate) || { total: 0, count: 0 };
            last7DaysData.push({
                date: formattedDate,
                total: data.total,
                count: data.count,
            });
        }
        return last7DaysData;
    }

    async getMonthlyDonationsLastNMonths(
        nMonths: number = 6,
    ): Promise<{ month: string; total: number; count: number }[]> {
        if (nMonths <= 0) {
            this.logger.warn(
                `Valor de 'nMonths' inválido: ${nMonths}. Usando 6 por defecto.`,
            ); // <-- USO DEL LOGGER
            nMonths = 6;
        }

        const result = await this.donationRepo
            .createQueryBuilder("donation")
            .select("TO_CHAR(donation.createdAt, 'YYYY-MM')", "month")
            .addSelect("SUM(donation.amount)", "total")
            .addSelect("COUNT(donation.id)", "count")
            .where(`donation.createdAt >= NOW() - INTERVAL '${nMonths} months'`)
            .andWhere("donation.status = :status", { status: "completed" })
            .groupBy("month")
            .orderBy("month", "ASC")
            .getRawMany<{ month: string; total: string; count: string }>();

        const today = new Date();
        const monthsMap = new Map<string, { total: number; count: number }>();
        result.forEach((row) =>
            monthsMap.set(row.month, {
                total: parseFloat(row.total),
                count: parseInt(row.count),
            }),
        );

        const lastNMonthsData: {
            month: string;
            total: number;
            count: number;
        }[] = [];

        for (let i = nMonths - 1; i >= 0; i--) {
            const date = new Date(today.getFullYear(), today.getMonth() - i, 1);
            const formattedMonth = date.toISOString().substring(0, 7);
            const data = monthsMap.get(formattedMonth) || {
                total: 0,
                count: 0,
            };
            lastNMonthsData.push({
                month: formattedMonth,
                total: data.total,
                count: data.count,
            });
        }
        return lastNMonthsData;
    }

    /** Crea una donación para un usuario */
    async create(
        dto: CreateDonationDto,
        user: User,
    ): Promise<{
        donation: Donation;
        checkoutUrl: string;
        preferenceId: string;
    }> {
        // 1) Guardar la donación en la BD en estado "pending"
        //    Primero la creamos para obtener su 'id'
        const donation = this.donationRepo.create({
            user,
            amount: dto.amount,
            description: dto.description ?? "",
            status: "pending", // Inicialmente en pending, sin preferenceId aún
        });
        await this.donationRepo.save(donation); // Guarda para obtener el ID de la donación

        // 2) Crear preferencia en Mercado Pago
        const pref = await this.preferenceClient.create({
            body: {
                items: [
                    {
                        // Usamos un ID de ítem único, puede ser el mismo ID de la donación o un timestamp
                        id: `don-${donation.id}`,
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
                notification_url: this.config.get<string>(
                    "MP_NOTIFICATION_URL",
                ),
                // ¡IMPORTANTE! Añadimos external_reference con el ID de tu donación
                external_reference: donation.id,
            },
        });

        // 3) Extraer y validar URLs y preferenceId
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

        // 4) Actualizar la donación en la BD con el preferenceId de Mercado Pago
        //    (Ya tiene el ID, amount, description, user, y status "pending")
        await this.donationRepo.update(donation.id, { preferenceId });

        return { donation, checkoutUrl, preferenceId };
    }

    /** Busca una donación por su preferenceId (se mantiene por si acaso, aunque external_reference es mejor para webhooks) */

    async findByPreferenceId(prefId: string): Promise<Donation | null> {
        return this.donationRepo.findOne({
            where: { preferenceId: prefId },
            relations: ["user"],
        });
    }

    async findByExternalReference(extRef: string): Promise<Donation | null> {
        return this.donationRepo.findOne({
            where: { id: extRef }, // Asumimos que external_reference es el ID de tu donación
            relations: ["user"],
        });
    }

    async markAsCompleted(id: string): Promise<void> {
        await this.donationRepo.update(id, { status: "completed" });
    }

    async getUserDonationsSummary(
        user: User,
    ): Promise<{ total: number; count: number }> {
        const result = await this.donationRepo
            .createQueryBuilder("d")
            .select("SUM(d.amount)", "total")
            .addSelect("COUNT(d.id)", "count")
            .where("d.userId = :userId", { userId: user.id })
            .andWhere("d.status = :status", { status: "completed" })
            .getRawOne<{ total: string; count: string }>();

        // Si no hay filas, devolvemos 0 y 0
        if (!result) {
            return { total: 0, count: 0 };
        }

        return {
            total: parseFloat(result.total),
            count: parseInt(result.count, 10),
        };
    }

    async getTotalDonationsByUser(userId: string): Promise<number> {
        const result = await this.donationRepo
            .createQueryBuilder("donation")
            .select("COALESCE(SUM(donation.amount), 0)", "total")
            .where("donation.userId = :userId", { userId })
            .getRawOne<{ total: string }>();

        // En caso de undefined (sin filas), asumimos '0'
        const totalString = result?.total ?? "0";
        return parseFloat(totalString);
    }
}

/** Crea una donación para un usuario */
/*  async create(dto: CreateDonationDto, user: User): Promise<Donation> {
        const donation = this.donationRepo.create({ ...dto, user });
        return this.donationRepo.save(donation);
    } */

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
/* async create(
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
                notification_url: this.config.get<string>(
                    "MP_NOTIFICATION_URL",
                ),
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
    } */
