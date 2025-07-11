import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, JoinColumn } from 'typeorm';
import { User } from 'src/user/entity/user.entity';

export enum IncidentType {
  INCENDIO = 'incendio',
  ACCIDENTE = 'accidente',
}

export enum IncidentAction {
  ASISTIDO = 'asistido',
  ELIMINADO = 'eliminado',
}

@Entity('incidents')
export class Incident {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    type: 'enum',
    enum: IncidentType,
    default: IncidentType.ACCIDENTE,
  })
  incidentType: IncidentType;

  @Column('decimal', { precision: 9, scale: 6 })
  latitude: number;

  @Column('decimal', { precision: 9, scale: 6 })
  longitude: number;

  @Column({ nullable: true })
  locationDetail?: string;

  @Column({ nullable: true })
  commentaries?: string;

  // Usuario que reporta el incidente
  @Column()
  reporterId: number;

  @ManyToOne(() => User, user => user.reportedIncidents)
  @JoinColumn({ name: 'reporterId' })
  reporter: User;

  // Relación con el admin que maneja el incidente
  @Column({ nullable: true })
  adminId?: number;

  @ManyToOne(() => User, user => user.handledIncidents)
  @JoinColumn({ name: 'adminId' })
  admin?: User;

  // Acción tomada por el admin
  @Column({
    type: 'enum',
    enum: IncidentAction,
    nullable: true,
  })
  action?: IncidentAction;

  @Column({ nullable: true })
  adminCommentary?: string;
}
