import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    ManyToOne,
} from "typeorm";
import { User } from "src/user/entity/user.entity";

export enum IncidentType {
    ACCIDENTE = "accidente",
    INCENDIO = "incendio",
}

export enum IncidentStatus {
    ASISTIDO = "asistido",
    ELIMINADO = "eliminado",
}

@Entity()
export class Incident {
    @PrimaryGeneratedColumn('uuid')
    id: string

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
        nullable: true, // ⚠️ Ahora puede ser null al principio
    })
    status?: IncidentStatus;

    @ManyToOne(() => User, (user) => user.incidents, { eager: true })
    user: User;

    @CreateDateColumn()
    createdAt: Date;
}

export default Incident;
