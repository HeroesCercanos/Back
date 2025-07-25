// src/donation/entity/donation.entity.ts
import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    ManyToOne,
    CreateDateColumn,
} from "typeorm";
import { User } from "../../user/entity/user.entity";

@Entity("donation")
export class Donation {
    @PrimaryGeneratedColumn("uuid")
    id: string;


    @Column("decimal", { precision: 12, scale: 2 })
    amount: number;

    @Column({ length: 255 })
    description: string;

    @ManyToOne(() => User, (user) => user.donations, { eager: true })
    user: User;

    @CreateDateColumn()
    createdAt: Date;

    @Column({
        type: "enum",
        enum: ["pending", "completed"],
        default: "pending",
    })
    status: "pending" | "completed";

    // ← aquí agregamos preferenceId
    @Column({ nullable: true })
    preferenceId: string;
}
