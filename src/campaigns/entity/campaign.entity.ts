// src/campaign/campaign.entity.ts
import { Entity, Column, PrimaryGeneratedColumn } from "typeorm";

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

    @Column({ type: "boolean", default: true })
    isActive: boolean; // <-- por defecto true
}
