import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { EmailCampaign } from "./entities/campaign.entity";
import { EmailCampaignService } from "./email-campaign.service";
import { EmailCampaignController } from "./email-campaign.controller";
import { EmailCampaignCron } from "./email-campaign.cron";
import { User } from "src/user/entity/user.entity";


@Module({
    imports: [TypeOrmModule.forFeature([EmailCampaign, User])],
    providers: [EmailCampaignService, EmailCampaignCron],
    controllers: [EmailCampaignController],
})
export class EmailCampaignModule {}
