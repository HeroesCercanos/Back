// src/campaign/campaign.controller.ts
import {
    Controller,
    Get,
    Post,
    Body,
    Param,
    Delete,
    UseGuards,
    Patch,
} from "@nestjs/common";
import { CampaignService } from "./campaigns.service";
import { CreateCampaignDto } from "./dto/create-campaign.dto";
import { AuthGuard } from "@nestjs/passport";
import { RolesGuard } from "src/auth/guards/google-auth/roles.guard";
import { Role } from "src/user/role.enum";
import { Roles } from "src/cloudinary/roles.decorator";
import { UpdateCampaignDto } from "./dto/update-campaign.dto";

@Controller("campaigns")
export class CampaignController {
    constructor(private readonly service: CampaignService) {}

    @Get()
    getAll() {
        return this.service.findAll();
    }

    @Get(":id")
    getOne(@Param("id") id: string) {
        return this.service.findOne(id);
    }

    @UseGuards(AuthGuard("jwt"), RolesGuard)
    @Roles(Role.ADMIN)
    @Post()
    create(@Body() dto: CreateCampaignDto) {
        return this.service.create(dto);
    }

    @UseGuards(AuthGuard("jwt"), RolesGuard)
    @Roles(Role.ADMIN)
    @Delete(":id")
    remove(@Param("id") id: string) {
        return this.service.remove(id);
    }

    @UseGuards(AuthGuard("jwt"), RolesGuard)
    @Roles(Role.ADMIN)
    @Patch(":id")
    edit(@Param("id") id: string, @Body() dto: UpdateCampaignDto) {
        return this.service.update(id, dto);
    }

    @UseGuards(AuthGuard("jwt"), RolesGuard)
    @Roles(Role.ADMIN)
    @Patch(":id/finish")
    finish(@Param("id") id: string) {
        return this.service.finish(id);
    }
}
