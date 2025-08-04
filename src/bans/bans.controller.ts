// src/bans/bans.controller.ts
import {
    Controller,
    Get,
    Param,
    ParseUUIDPipe,
    UseGuards,
} from "@nestjs/common";
import { BanService } from "./ban.service";
import { Roles } from "src/auth/decorator/roles.decorator";
import { Role } from "src/user/role.enum";
import { RolesGuard } from "src/auth/guards/google-auth/roles.guard";
import { AuthGuard } from "@nestjs/passport";

@Controller("bans")
export class BansController {
    constructor(private readonly banService: BanService) {}

    /** GET /bans/user/:id/count */
    @Get("user/:id/count")
    @UseGuards(AuthGuard("jwt"), RolesGuard)
    @Roles(Role.ADMIN)
    async countByUser(
        @Param("id", new ParseUUIDPipe()) userId: string,
    ): Promise<{ userId: string; totalBans: number }> {
        const totalBans = await this.banService.countByUser(userId);
        return { userId, totalBans };
    }
}
