import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class Media {
    @PrimaryGeneratedColumn("uuid")
    id: string;

    @Column()
    public_id: string;

    @Column()
    secure_url: string;

    @Column()
    resource_type: string;

    @Column({ nullable: true })
    format: string;

    @Column({ nullable: true })
    duration: number;

    @Column({ nullable: true })
    caption: string; // 👈 acá lo guardás
}
