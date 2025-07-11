import { IncidentType } from '../entity/incident.entity/incident.entity';

export class CreateIncidentDto {
  incidentType: IncidentType;
  latitude: number;
  longitude: number;
  locationDetail?: string;
  commentaries?: string;
  reporterId: number;
}