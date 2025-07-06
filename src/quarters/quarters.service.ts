import { Injectable } from "@nestjs/common";

@Injectable()
export class QuartersService {
    findAll() {
        // podrías delegar aquí; por ahora devuelve vacío
        return "Acá están todos los cuarteles";
    }
}
