// src/bans/ban.entity.ts
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn } from "typeorm";
import { User } from "../../user/entity/user.entity";

@Entity()
export class Ban {
    @PrimaryGeneratedColumn("uuid")
    id: string;

    @ManyToOne(() => User, (user) => user.bans, { eager: true })
    user: User;

    @Column({ type: "timestamp with time zone" })
    expiresAt: Date;

    @Column({ type: "boolean", default: false })
    manual: boolean; // true si lo hizo un admin

    /** CUÁNDO SE CREÓ este registro de baneo */
    @CreateDateColumn({ type: "timestamptz" })
    createdAt: Date;

    /** CUÁNDO SE LEVANTÓ el baneo */
    @Column({ type: "timestamptz", nullable: true })
    reactivatedAt?: Date;
}
