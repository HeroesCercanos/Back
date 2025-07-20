import { PartialType } from '@nestjs/mapped-types';
import { CreateCampaignDto } from './create-campaign.dto';
import { IsEnum, IsOptional } from 'class-validator';
import { CampaignStatus } from '../entity/campaign.entity'; 

export class UpdateCampaignDto extends PartialType(CreateCampaignDto) {
  @IsEnum(CampaignStatus)
  @IsOptional()
  status?: CampaignStatus;
}