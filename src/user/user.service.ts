
import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { User } from "./entity/user.entity"; // ajustá ruta si necesario



@Injectable()
export class UserService {
    constructor(
        @InjectRepository(User)
        private userRepository: Repository<User>,

    ) {}
    // Devuelve todos los usuarios
    async findAll(): Promise<User[]> {
        return this.userRepository.find();
    }

    ) { }


    // Devuelve User | undefined en lugar de lanzar excepción
    async findByEmail(email: string): Promise<User | null> {
        return this.userRepository.findOne({ where: { email } });
    }


    async findByGoogleId(googleId: string): Promise<User | null> {
        return this.userRepository.findOne({ where: { googleId } });
    }


    async create(data: Partial<User>): Promise<User> {
        const user = this.userRepository.create(data);
        return this.userRepository.save(user);
    }


    async update(id: string, attrs: Partial<User>): Promise<User> {
        await this.userRepository.update(id, attrs);
        const user = await this.userRepository.findOne({ where: { id } });
        if (!user) {
            throw new Error(`User with id ${id} not found`);
        }
        return user;
    }
    async updateLocation(
        id: string,
        latitude: number,
        longitude: number,
    ): Promise<User> {
        return this.update(id, { latitude, longitude });
    }
}

}

