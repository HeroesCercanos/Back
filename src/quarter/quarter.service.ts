import { Injectable } from "@nestjs/common";
import { QuarterRepository } from "./quarter.repository";

@Injectable()
export class QuarterService {
    constructor(private readonly quarterRepository: QuarterRepository){}
    async findAll() {
        // podrías delegar aquí; por ahora devuelve vacío
        return   this.quarterRepository.findAll()
    }

    async findOne(id: number) {
        // podrías delegar aqui; por ahora devuelve vacío
        return this.quarterRepository.findOne(id)
    }
}
