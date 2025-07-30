import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    UpdateDateColumn,
    OneToMany,
} from "typeorm";
import { ScheduledEmail } from "./scheduled-email.entity";

@Entity("email_templates")
export class EmailTemplate {
    @PrimaryGeneratedColumn("uuid")
    id: string;

    @Column({ unique: true })
    name: string;

    @Column()
    subject: string;

    @Column("text")
    htmlContent: string;

    @CreateDateColumn() createdAt: Date;
    @UpdateDateColumn() updatedAt: Date;

    @OneToMany(() => ScheduledEmail, (job) => job.template)
    scheduledJobs: ScheduledEmail[];
}
