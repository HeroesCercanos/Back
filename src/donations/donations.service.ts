// src/donation/donation.service.ts
import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository, SelectQueryBuilder } from "typeorm";
import { Donation } from "./entity/donation.entity";
import { CreateDonationDto } from "./dto/create-donatio.dto.";
import { User } from "../user/entity/user.entity";

@Injectable()
export class DonationService {
    constructor(
        @InjectRepository(Donation)
        private readonly donationRepo: Repository<Donation>,
    ) {}

    /** Crea una donación para un usuario */
    async create(dto: CreateDonationDto, user: User): Promise<Donation> {
        const donation = this.donationRepo.create({ ...dto, user });
        return this.donationRepo.save(donation);
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
}
