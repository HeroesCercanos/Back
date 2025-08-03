import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { IncidentService } from './incidents.service'; 
import { IncidentController } from './incidents.controller'; 
import { Incident } from './entity/incident.entity'; 
import IncidentHistory from './entity/incident-history.entity';
import { MailModule } from 'src/mail/mail.module';
import { UserModule } from 'src/user/user.module';
import { BansModule } from 'src/bans/ban.module';

@Module({
  imports: [TypeOrmModule.forFeature([Incident, IncidentHistory]), UserModule, MailModule, BansModule],
  providers: [IncidentService],
  controllers: [IncidentController],
})
export class IncidentModule {}