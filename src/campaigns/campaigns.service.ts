// src/campaign/campaign.service.ts
import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Cron, CronExpression } from "@nestjs/schedule";

import { Campaign } from "./entity/campaign.entity";
import { CreateCampaignDto } from "./dto/create-campaign.dto";
import { UpdateCampaignDto } from "./dto/update-campaign.dto";

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
            isActive: true, // por defecto activo
        });
        return this.repo.save(campaign);
    }

    async findAll(): Promise<Campaign[]> {
        await this.markExpiredCampaigns();
        return this.repo.find();
    }

    async findOne(id: string): Promise<Campaign> {
        const campaign = await this.repo.findOne({ where: { id } });
        if (!campaign) {
            throw new NotFoundException(`Campaign ${id} no encontrada`);
        }
        return campaign;
    }

    async remove(id: string): Promise<void> {
        const result = await this.repo.delete(id);
        if (result.affected === 0) {
            throw new NotFoundException(`Campaign ${id} no encontrada`);
        }
    }

    async update(id: string, dto: UpdateCampaignDto): Promise<Campaign> {
        const campaign = await this.findOne(id);

        // Actualizo solo los campos que vienen en el DTO
        if (dto.title !== undefined) campaign.title = dto.title;
        if (dto.description !== undefined)
            campaign.description = dto.description;
        if (dto.startDate) campaign.startDate = new Date(dto.startDate);
        if (dto.endDate) campaign.endDate = new Date(dto.endDate);
        if (dto.isActive !== undefined) campaign.isActive = dto.isActive;

        return this.repo.save(campaign);
    }

    async finish(id: string): Promise<Campaign> {
        return this.update(id, { isActive: false });
    }

    async reactivateCampaign(id: string): Promise<Campaign> {
        if (!id) {
            throw new NotFoundException(`Campaign ${id} no encontrada`);
        }

        return this.update(id, { isActive: true });
    }

    /** Marca como finalizada todas las campañas activas cuya endDate ya pasó */
    private async markExpiredCampaigns(): Promise<void> {
        await this.repo
            .createQueryBuilder()
            .update(Campaign)
            .set({ isActive: false })
            .where("isActive = :active", { active: true })
            .andWhere("endDate < :today", { today: new Date() })
            .execute();
    }

    /** Job diario a medianoche para finalizar automáticamente las campañas expiradas */
    @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
    handleCron() {
        return this.markExpiredCampaigns();
    }
}
