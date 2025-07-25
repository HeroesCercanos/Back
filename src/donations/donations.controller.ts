// src/donation/donation.controller.ts
import { Controller, Post, Get, Body, Req, UseGuards } from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";
import { DonationService } from "./donations.service";
import { CreateDonationDto } from "./dto/create-donatio.dto.";
import { Donation } from "./entity/donation.entity";
import { User } from "src/user/entity/user.entity";
import { CurrentUser } from "src/auth/decorator/current-user.decorator";

@Controller("donations")
export class DonationController {
    constructor(private readonly donationService: DonationService) {}

    // 🧑‍💼 Usuario logueado crea una donación
    /*  @Post()
    @UseGuards(AuthGuard("jwt"))
    create(@Req() req: any, @Body() dto: CreateDonationDto): Promise<Donation> {
        return this.donationService.create(dto, req.user);
    } */

    // 📋 Historial de donaciones del usuario
    @Get()
    @UseGuards(AuthGuard("jwt"))
    findByUser(@Req() req: any): Promise<Donation[]> {
        return this.donationService.findByUser(req.user);
    }

    // 🔒 Total de todas las donaciones (admin o público)
    @Get("admin/total")
    total(): Promise<number> {
        return this.donationService.totalDonations();
    }

    // 🔒 Historial mensual (admin)
    @Get("admin/history")
    monthly(): Promise<{ month: string; total: number }[]> {
        return this.donationService.monthlyDonations();
    }

    // MercadoPago
    /* @Post("create_preference")
    createPreference(
        @Body()
        { amount, description }: { amount: number; description: string },
    ) {
        return this.donationService.createPreference(amount, description);
    } */

    @Post("create_preference")
    @UseGuards(AuthGuard("jwt"))
    async createPreference(
        @Body() dto: CreateDonationDto,
        @CurrentUser() user: User,
    ): Promise<{ donationId: string; checkoutUrl: string }> {
        const { donation, checkoutUrl } = await this.donationService.create(
            dto,
            user,
        );
        return { donationId: donation.id, checkoutUrl };
    }
}
