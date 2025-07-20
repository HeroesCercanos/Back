// src/campaign/campaign.service.ts
import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
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
        });
        return this.repo.save(campaign);
    }

    async findAll(): Promise<Campaign[]> {
        return this.repo.find();
    }

    async findOne(id: string): Promise<Campaign> {
        const c = await this.repo.findOne({ where: { id } });
        if (!c) throw new NotFoundException(`Campaign ${id} no encontrada`);
        return c;
    }

    async remove(id: string): Promise<void> {
        await this.repo.delete(id);
    }

    async update(id: string, dto: UpdateCampaignDto): Promise<Campaign> {
        const campaign = await this.findOne(id);
        Object.assign(campaign, { ...dto });
        return this.repo.save(campaign);
    }

    async finish(id: string): Promise<Campaign> {
        return this.update(id, { isActive: false });
    }

    // opcional: update
    // async update(id: number, dto: UpdateCampaignDto): Promise<Campaign> { ... }
}
