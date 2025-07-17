import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { IncidentService } from './incidents.service'; 
import { IncidentController } from './incidents.controller'; 
import { Incident } from './entity/incident.entity'; 
import IncidentHistory from './entity/incident-history.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Incident, IncidentHistory])],
  providers: [IncidentService],
  controllers: [IncidentController],
})
export class IncidentModule {}