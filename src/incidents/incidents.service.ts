import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Incident } from "./entity/incident.entity/incident.entity";
import { CreateIncidentDto } from "./dto/create-incident.dto";
import { AdminActionDto } from "./dto/admin-action.dto";
import { User } from "src/user/entity/user.entity";

@Injectable()
export class IncidentService {
    constructor(
        @InjectRepository(Incident)
        private readonly incidentRepo: Repository<Incident>,
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
        if (!incident) throw new NotFoundException("Incidente no encontrado");

        Object.assign(incident, dto);
        return this.incidentRepo.save(incident);
    }
}
