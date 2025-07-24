import {
    Entity,
    Column,
    PrimaryGeneratedColumn,
    CreateDateColumn,
    OneToMany,
} from "typeorm";
import { Role } from "../role.enum";
import { Incident } from "src/incidents/entity/incident.entity";

@Entity()
export class User {
    [x: string]: any;
    @PrimaryGeneratedColumn("uuid")
    id: string;

    @Column({ unique: true })
    email: string;

    @Column()
    name: string;

    @Column({ type: "varchar", nullable: true })
    password: string;

    @Column({ nullable: true })
    picture: string;

    @CreateDateColumn()
    createdAt: Date;

    @Column({ type: "varchar", nullable: true, default: null })
    googleId?: string;

    @Column({ nullable: true })
    phone?: string;

    @Column({ nullable: true })
    address?: string;

    @Column({
        type: "enum",
        enum: Role,
        default: Role.USER,
    })
    role: Role;

    @Column("decimal", { precision: 9, scale: 6, nullable: true })
    latitude?: number;

    @Column("decimal", { precision: 9, scale: 6, nullable: true })
    longitude?: number;
    // Incidentes reportados por el usuario

    @OneToMany(() => Incident, (incident) => incident.user)
    incidents: Incident[];

    @Column({ type: "text", nullable: true })
    resetToken: string | null;

    @Column({ type: "timestamp", nullable: true })
    resetTokenExpires: Date | null;
}
