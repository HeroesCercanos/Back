import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    ManyToOne,
    JoinColumn,
    CreateDateColumn,
    UpdateDateColumn,
} from "typeorm";
import { EmailTemplate } from "./email-template.entity";

export type Frequency = "daily" | "weekly" | "monthly" | "custom";

@Entity("scheduled_emails")
export class ScheduledEmail {
    @PrimaryGeneratedColumn("uuid")
    id: string;

    @ManyToOne(() => EmailTemplate, (tpl) => tpl.scheduledJobs, {
        eager: true,
        onDelete: "CASCADE",
    })
    @JoinColumn({ name: "templateId" })
    template: EmailTemplate;

    @Column({
        type: "enum",
        enum: ["daily", "weekly", "monthly", "custom"],
        default: "daily",
    })
    frequency: Frequency;

    @Column({ nullable: true, comment: "Cron expr if frequency=custom" })
    cronExpression?: string;

    @Column({ default: true })
    enabled: boolean;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
}
