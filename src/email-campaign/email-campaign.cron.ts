import { Injectable } from "@nestjs/common";
import { Cron, CronExpression } from "@nestjs/schedule";
import { EmailCampaignService } from "./email-campaign.service";

@Injectable()
export class EmailCampaignCron {
    constructor(private readonly emailService: EmailCampaignService) {}

    @Cron(CronExpression.EVERY_MINUTE)
    async handleScheduledEmails() {
        const pending = await this.emailService.getPendingCampaigns();

        for (const campaign of pending) {
            await this.emailService.sendEmails(campaign);
        }
    }
}
