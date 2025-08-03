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
import { BanService } from "src/bans/ban.service";
import { UserService } from "src/user/user.service";
import { MailService } from "src/mail/mail.service";

@Injectable()
export class IncidentService {
    constructor(
        @InjectRepository(Incident)
        private readonly incidentRepo: Repository<Incident>,
        @InjectRepository(IncidentHistory)
        private readonly historyRepo: Repository<IncidentHistory>,
        private readonly mailService: MailService,
        private readonly banService: BanService,
        private readonly userService: UserService, // para disparar el baneo
    ) {}

    /*  async create(dto: CreateIncidentDto, user: User): Promise<Incident> {
        if (!user) {
            console.error("El usuario no está definido");
            throw new Error("Usuario no autenticado");
        }

        const incident = this.incidentRepo.create({ ...dto, user });
        return this.incidentRepo.save(incident);
    } */

    async create(dto: CreateIncidentDto, user: User): Promise<Incident> {
        if (!user) throw new Error("Usuario no autenticado");

        const incident = this.incidentRepo.create({ ...dto, user });
        const saved = await this.incidentRepo.save(incident);

        // Envío de email a admin y usuario
        await this.mailService.sendIncidentEmail({
            name: user.name,
            email: user.email,
            type: dto.type,
            location: `${dto.latitude},${dto.longitude}`,
        });

        return saved;
    }

    async findAll(): Promise<Incident[]> {
        return this.incidentRepo.find({ order: { createdAt: "DESC" } });
    }

    async updateByAdmin(id: string, dto: AdminActionDto): Promise<Incident> {
        const incident = await this.incidentRepo.findOne({
            where: { id },
            relations: ["user"],
        });
        if (!incident) throw new NotFoundException();

        Object.assign(incident, dto);
        const updated = await this.incidentRepo.save(incident);

        // Historial
        await this.historyRepo.save(
            this.historyRepo.create({
                incident,
                action: dto.status,
                comment: dto.adminComment,
                victimName: dto.victimName,
                reason: dto.reason,
                createdAt: new Date(),
            }),
        );

        // Baneo automático (y mail dentro de BanService)
        if (dto.status === IncidentStatus.ELIMINADO) {
            await this.banService.banUser(incident.user.id, true);
        }

        return updated;
    }
    async updateStatus(
        id: string,
        status: IncidentStatus,
        adminOverride = false,
    ): Promise<Incident> {
        const incident = await this.incidentRepo.findOne({
            where: { id },
            relations: ["user"],
        });
        if (!incident) throw new NotFoundException();

        incident.status = status;
        await this.incidentRepo.save(incident);

        if (status === IncidentStatus.ELIMINADO) {
            await this.banService.banUser(incident.user.id, adminOverride);
        }

        return incident;
    }
    /**
     * Método genérico para actualizar sólo el status,
     * permitiendo indicar si es override (admin) o no.
     */
    /* async updateStatus(
        id: string,
        status: IncidentStatus,
        adminOverride = false,
    ): Promise<Incident> {
        const incident = await this.incidentRepo.findOne({
            where: { id },
            relations: ["user"],
        });
        if (!incident) throw new NotFoundException("Incident not found");

        incident.status = status;
        await this.incidentRepo.save(incident);

        if (status === IncidentStatus.ELIMINADO) {
            await this.userService.setActiveStatus(incident.user.id, false);
        }

        return incident;
    } */

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

/* async updateByAdmin(id: string, dto: AdminActionDto): Promise<Incident> {
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

    async updateStatus(
        id: string,
        status: IncidentStatus,
        adminOverride = false,
    ) {
        const incident = await this.bansRepo.findOneOrFail({
            where: { id },
            relations: ["reporter"],
        });
        incident.status = status;
        await this.bansRepo.save(incident);

        if (status === IncidentStatus.ELIMINADO) {
            // Reporter es quien hizo la falsa alarma
            await this.banService.banUser(incident.user.id, adminOverride);
        }

        return incident;
    } */
