import {
    Entity,
    Column,
    PrimaryGeneratedColumn,
    CreateDateColumn,
} from "typeorm";
import { Role } from "../role.enum";

@Entity()
export class User {
    @PrimaryGeneratedColumn("uuid")
    id: number;

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

     @Column({ type: 'varchar', nullable: true, default: null })
    googleId?: string;

    @Column({
        type: "enum",
        enum: Role,
        default: Role.USER,
    })
    role: Role;
}
