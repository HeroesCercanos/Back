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
    Req,
    HttpCode,
} from "@nestjs/common";
import { CampaignService } from "./campaigns.service";
import { CreateCampaignDto } from "./dto/create-campaign.dto";
import { AuthGuard } from "@nestjs/passport";
import { RolesGuard } from "src/auth/guards/google-auth/roles.guard";
import { Role } from "src/user/role.enum";
import { Roles } from "src/auth/decorator/roles.decorator";
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
    create(@Req() req, @Body() dto: CreateCampaignDto) {
        console.log(">>> req.user en create:", req.user);
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

    @UseGuards(AuthGuard("jwt"), RolesGuard)
    @Roles(Role.ADMIN)
    @HttpCode(204)
    @Patch(":id/reactivate")
    reactivate(@Param("id") id: string) {
        const updated = this.service.reactivateCampaign(id);
        if (!updated) throw new Error(`Campaign ${id} not found`);
    }
}
