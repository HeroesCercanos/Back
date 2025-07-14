import { IsEnum, IsNotEmpty, IsNumber, IsOptional, IsString } from "class-validator";
import { IncidentAction } from "src/incidents/entity/incident.entity/incident.entity";

export class AdminActionDto {
    @IsEnum(IncidentAction)
    action: IncidentAction;

    @IsString()
    @IsNotEmpty()
    adminCommentary: string;

    @IsOptional()
    @IsNumber()
    adminId?: number; // puede omitirse si se obtiene vía auth (chequear bien)
}
