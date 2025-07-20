// src/campaign/campaign.entity.ts
import { Entity, Column, PrimaryGeneratedColumn } from "typeorm";

export enum CampaignStatus {
    ACTIVE = "active",
    FINALIZADA = "finalizada",
}

@Entity({ name: "campaigns" })
export class Campaign {
    @PrimaryGeneratedColumn("uuid")
    id: string;

    @Column({ length: 200 })
    title: string;

    @Column({ type: "text", nullable: true })
    description?: string;

    @Column({ type: "date" })
    startDate: Date;

    @Column({ type: "date" })
    endDate: Date;

    @Column({ type: "enum", enum: CampaignStatus, default: CampaignStatus.ACTIVE })
    status: CampaignStatus; 
}
