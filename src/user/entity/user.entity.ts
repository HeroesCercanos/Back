import {
    Entity,
    Column,
    PrimaryGeneratedColumn,
    CreateDateColumn,
    OneToMany,
} from "typeorm";
import { Role } from "../role.enum";
import { Incident } from "src/incidents/entity/incident.entity/incident.entity";

@Entity()
export class User {
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

    @Column({ nullable: true })
    phone: string;

    @Column({ nullable: true })
    address: string;

    @CreateDateColumn()
    createdAt: Date;

    @Column({ type: "varchar", nullable: true, default: null })
    googleId?: string;

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
    @OneToMany(() => Incident, (incident) => incident.reporter)
    reportedIncidents: Incident[];

    // Incidentes manejados por el usuario (admin)
    @OneToMany(() => Incident, (incident) => incident.admin)
    handledIncidents: Incident[];
}
