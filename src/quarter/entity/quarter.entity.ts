import { Entity, PrimaryGeneratedColumn, Column } from "typeorm";

@Entity("quarter")
export class Quarter {
    @PrimaryGeneratedColumn() id: number;

    @Column() name: string;

    @Column() address: string;

    @Column("point") location: string;

    @Column() phone: string;

    @Column() email: string;

    @Column({ nullable: true }) description: string;
}
