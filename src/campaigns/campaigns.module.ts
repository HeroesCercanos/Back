// src/campaign/campaign.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Campaign } from './entity/campaign.entity'; 
import { CampaignService } from './campaigns.service'; 
import { CampaignController } from './campaigns.controller'; 
import { RolesGuard } from 'src/auth/guards/google-auth/roles.guard';

@Module({
  imports: [TypeOrmModule.forFeature([Campaign])],
  providers: [CampaignService, RolesGuard],
  controllers: [CampaignController],
})
export class CampaignModule {}
