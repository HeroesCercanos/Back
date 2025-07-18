import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    ManyToOne,
    OneToMany,
} from "typeorm";
import { User } from "src/user/entity/user.entity";
import IncidentHistory from "./incident-history.entity";

export enum IncidentType {
    ACCIDENTE = "accidente",
    INCENDIO = "incendio",
}

export enum IncidentStatus {
    ACTIVO = "activo",
    ASISTIDO = "asistido",
    ELIMINADO = "eliminado",
}

@Entity()
export class Incident {
    @PrimaryGeneratedColumn("uuid")
    id: string;

    @Column({
        type: "enum",
        enum: IncidentType,
    })
    type: IncidentType;

    @Column("decimal", { precision: 10, scale: 6 })
    latitude: number;

    @Column("decimal", { precision: 10, scale: 6 })
    longitude: number;

    @Column({ nullable: true })
    description?: string;

    @Column({ nullable: true })
    victimName?: string;

    @Column({ nullable: true })
    reason?: string;

    @Column({ nullable: true })
    adminComment?: string;

    @Column({
        type: "enum",
        enum: IncidentStatus,
        default: IncidentStatus.ACTIVO, // valor por defecto
    })
    status: IncidentStatus;

    @ManyToOne(() => User, (user) => user.incidents, { eager: true })
    user: User;

    @CreateDateColumn()
    createdAt: Date;

    @OneToMany(() => IncidentHistory, (history) => history.incident)
    history: IncidentHistory[];
}

export default Incident;
