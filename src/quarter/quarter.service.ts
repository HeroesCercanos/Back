import { Injectable } from "@nestjs/common";

@Injectable()
export class QuarterService {
    findAll() {
        // podrías delegar aquí; por ahora devuelve vacío
        return "Acá están todos los cuarteles";
    }
}
