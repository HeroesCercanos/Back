import { IsEnum, IsLatitude, IsLongitude, IsOptional, IsString } from 'class-validator';
import { IncidentType } from '../entity/incident.entity'; 

export class CreateIncidentDto {
  @IsEnum(IncidentType)
  type: IncidentType;

  @IsLatitude()
  latitude: number;

  @IsLongitude()
  longitude: number;

  @IsOptional()
  @IsString()
  description?: string;
}
