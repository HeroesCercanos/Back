import { IsEnum, IsOptional, IsString } from "class-validator";
import { IncidentStatus } from "../entity/incident.entity/incident.entity";

export class AdminActionDto {
    @IsOptional()
    @IsString()
    victimName?: string;

    @IsOptional()
    @IsString()
    reason?: string;

    @IsOptional()
    @IsString()
    adminComment?: string;

    @IsEnum(IncidentStatus)
    status: IncidentStatus; // solo "asistido" o "eliminado"
}

export default AdminActionDto