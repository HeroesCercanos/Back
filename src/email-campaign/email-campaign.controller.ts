import {
    Controller,
    Post,
    Body,
    Get,
    Param,
    Patch,
    Delete,
    ParseIntPipe,
    UseGuards,
} from "@nestjs/common";
import { EmailCampaignService } from "./email-campaign.service";
import { CreateCampaignDto } from "./dto/create-campaign.dto";
import { Roles } from "src/auth/decorator/roles.decorator";
import { JwtAuthGuard } from "src/cloudinary/jwt-auth.guard";
import { RolesGuard } from "src/auth/guards/google-auth/roles.guard";
import { Role } from "src/user/role.enum";
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.ADMIN)
@Controller("api/campaigns")
export class EmailCampaignController {
    constructor(private readonly emailService: EmailCampaignService) {}

    @Post()
    create(@Body() dto: CreateCampaignDto) {
        return this.emailService.createCampaign(dto);
    }

    @Get()
    findAll() {
        return this.emailService.getAll();
    }

    @Post(":id/send-now")
    sendNow(@Param("id", ParseIntPipe) id: number) {
        console.log("📩 POST /send-now ID:", id);
        return this.emailService.sendEmailsById(id);
    }

    @Patch(":id")
    updateCampaign(
        @Param("id", ParseIntPipe) id: number,
        @Body() dto: Partial<CreateCampaignDto>,
    ) {
        return this.emailService.updateCampaign(id, dto);
    }

    @Delete(":id")
    deleteCampaign(@Param("id", ParseIntPipe) id: number) {
        return this.emailService.deleteCampaign(id);
    }

    @Post(":id/resend")
    resendCampaign(@Param("id", ParseIntPipe) id: number) {
        return this.emailService.sendEmailsById(id);
    }
}
