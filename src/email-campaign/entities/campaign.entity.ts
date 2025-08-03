import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
} from "typeorm";

@Entity("email_campaigns")
export class EmailCampaign {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    subject: string;

    @Column()
    templateName: string;

    @Column("text")
    variables: string;

    @Column()
    status: "draft" | "scheduled" | "sent";

    @Column({ nullable: true })
    scheduledAt: Date;

    @Column("text")
    recipients: string;

    @CreateDateColumn()
    createdAt: Date;
}
