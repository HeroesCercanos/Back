import { IsNumber } from "class-validator";

export class SendCampaignDto {
    @IsNumber()
    campaignId: number;
}
