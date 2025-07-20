// src/campaign/campaign.service.ts
import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Campaign, CampaignStatus } from "./entity/campaign.entity";
import { CreateCampaignDto } from "./dto/create-campaign.dto";
import { UpdateCampaignDto } from "./dto/update-campaign.dto";
import { Cron, CronExpression } from "@nestjs/schedule";
@Injectable()
export class CampaignService {
    constructor(
        @InjectRepository(Campaign)
        private readonly repo: Repository<Campaign>,
    ) {}

    async create(dto: CreateCampaignDto): Promise<Campaign> {
        const campaign = this.repo.create({
            ...dto,
            startDate: new Date(dto.startDate),
            endDate: new Date(dto.endDate),
            status: CampaignStatus.ACTIVE,
        });
        return this.repo.save(campaign);
    }

    async findAll(): Promise<Campaign[]> {
        // opcional: actualizar expiradas antes de devolver
        await this.markExpiredCampaigns();
        return this.repo.find();
    }

    async findOne(id: string): Promise<Campaign> {
        const c = await this.repo.findOne({ where: { id } });
        if (!c) throw new NotFoundException(`Campaign ${id} no encontrada`);
        return c;
    }

    async remove(id: string): Promise<void> {
        const result = await this.repo.delete(id);
        if (result.affected === 0) {
            throw new NotFoundException(`Campaign ${id} no encontrada`);
        }
    }

    async update(id: string, dto: UpdateCampaignDto): Promise<Campaign> {
        const campaign = await this.findOne(id);
        Object.assign(campaign, {
            ...dto,
            // si actualizan fechas, asegúrate de convertir:
            ...(dto.startDate && { startDate: new Date(dto.startDate) }),
            ...(dto.endDate && { endDate: new Date(dto.endDate) }),
        });
        return this.repo.save(campaign);
    }

    async finish(id: string): Promise<Campaign> {
        return this.update(id, { status: CampaignStatus.FINALIZADA });
    }

    private async markExpiredCampaigns(): Promise<void> {
        await this.repo
            .createQueryBuilder()
            .update(Campaign)
            .set({ status: CampaignStatus.FINALIZADA })
            .where("status = :active", { active: CampaignStatus.ACTIVE })
            .andWhere("endDate < :today", { today: new Date() })
            .execute();
    }

    /** Job diario a medianoche para finalizar campañas expiradas automáticamente */
    @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
    handleCron() {
        return this.markExpiredCampaigns();
    }

    // opcional: update
    // async update(id: number, dto: UpdateCampaignDto): Promise<Campaign> { ... }
}
