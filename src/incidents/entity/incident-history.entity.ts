import {
    Column,
    CreateDateColumn,
    Entity,
    JoinColumn,
    ManyToOne,
    PrimaryGeneratedColumn,
} from "typeorm";
import Incident from "./incident.entity";

@Entity()
export class IncidentHistory {
    @PrimaryGeneratedColumn("uuid")
    id: string;

    @Column()
    incidentId: string; // Clave foránea explícita

    @ManyToOne(() => Incident, (incident) => incident.history, { eager: true })
    @JoinColumn({ name: "incidentId" })
    incident: Incident;

    @Column()
    action: string; // 'asistido' o 'eliminado'

    @Column({ nullable: true })
    comment?: string;

    @Column({ nullable: true })
    victimName?: string;

    @Column({ nullable: true })
    reason?: string;

    @CreateDateColumn()
    createdAt: Date;
}

export default IncidentHistory;
