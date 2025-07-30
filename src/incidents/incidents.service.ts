import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import {
    Incident,
    IncidentStatus,
    IncidentType,
} from "./entity/incident.entity";
import { CreateIncidentDto } from "./dto/create-incident.dto";
import { AdminActionDto } from "./dto/admin-action.dto";
import { User } from "src/user/entity/user.entity";
import { IncidentHistory } from "./entity/incident-history.entity";
import { ReportMetrics } from "./interface/incidents.interface";

@Injectable()
export class IncidentService {
    constructor(
        @InjectRepository(Incident)
        private readonly incidentRepo: Repository<Incident>,
        @InjectRepository(IncidentHistory)
        private readonly historyRepo: Repository<IncidentHistory>,
    ) {}

    async create(dto: CreateIncidentDto, user: User): Promise<Incident> {
        if (!user) {
            console.error("El usuario no está definido");
            throw new Error("Usuario no autenticado");
        }

        const incident = this.incidentRepo.create({ ...dto, user });
        return this.incidentRepo.save(incident);
    }

    async findAll(): Promise<Incident[]> {
        return this.incidentRepo.find({ order: { createdAt: "DESC" } });
    }

    async updateByAdmin(id: string, dto: AdminActionDto): Promise<Incident> {
        const incident = await this.incidentRepo.findOneBy({ id });
        if (!incident) throw new NotFoundException("Incident not found");

        // Aplicar los cambios
        Object.assign(incident, dto);
        const updatedIncident = await this.incidentRepo.save(incident);

        // Crear historial
        const history = this.historyRepo.create({
            incident,
            action: dto.status,
            comment: dto.adminComment,
            victimName: dto.victimName,
            reason: dto.reason,
            createdAt: new Date(),
        });
        await this.historyRepo.save(history);

        return updatedIncident;
    }

    // Historial completo
    async getHistory(): Promise<IncidentHistory[]> {
        return this.historyRepo.find({
            order: { createdAt: "DESC" },
            relations: ["incident"],
        });
    }

    // Historial por incidente
    async getIncidentHistory(id: string): Promise<IncidentHistory[]> {
        return this.historyRepo.find({
            where: { incident: { id } },
            order: { createdAt: "DESC" },
            relations: ["incident"],
        });
    }

    /** Solo semanal */
    async getWeeklyReports(): Promise<{ week: Date; count: number }[]> {
        const raw = await this.incidentRepo
            .createQueryBuilder("i")
            .select("date_trunc('week', i.createdAt)", "period")
            .addSelect("COUNT(*)", "count")
            .groupBy("period")
            .orderBy("period", "DESC")
            .getRawMany<{ period: Date; count: string }>();

        return raw.map((r) => ({ week: r.period, count: +r.count }));
    }

    /** Solo mensual */
    async getMonthlyReports(): Promise<{ month: Date; count: number }[]> {
        const raw = await this.incidentRepo
            .createQueryBuilder("i")
            .select("date_trunc('month', i.createdAt)", "period")
            .addSelect("COUNT(*)", "count")
            .groupBy("period")
            .orderBy("period", "DESC")
            .getRawMany<{ period: Date; count: string }>();

        return raw.map((r) => ({ month: r.period, count: +r.count }));
    }

    /** Solo por estado */
    async getReportsByStatus(): Promise<
        { status: IncidentStatus; count: number }[]
    > {
        const raw = await this.incidentRepo
            .createQueryBuilder("i")
            .select("i.status", "status")
            .addSelect("COUNT(*)", "count")
            .groupBy("i.status")
            .getRawMany<{ status: IncidentStatus; count: string }>();

        return raw.map((r) => ({ status: r.status, count: +r.count }));
    }

    /** Solo por tipo */
    async getReportsByType(): Promise<{ type: IncidentType; count: number }[]> {
        const raw = await this.incidentRepo
            .createQueryBuilder("i")
            .select("i.type", "type")
            .addSelect("COUNT(*)", "count")
            .groupBy("i.type")
            .getRawMany<{ type: IncidentType; count: string }>();

        return raw.map((r) => ({ type: r.type, count: +r.count }));
    }

    /** Total */
    async getTotalReports(): Promise<number> {
        return this.incidentRepo.count();
    }
}
