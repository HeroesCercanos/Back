import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { IncidentService } from './incidents.service'; 
import { IncidentController } from './incidents.controller'; 
import { Incident } from './entity/incident.entity/incident.entity'; 

@Module({
  imports: [TypeOrmModule.forFeature([Incident])],
  providers: [IncidentService],
  controllers: [IncidentController],
})
export class IncidentModule {}