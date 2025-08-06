// src/donation/donation.controller.ts
import {
    Controller,
    Post,
    Get,
    Body,
    UseGuards,
    Query,
    Logger,
    Req,
    Param,
    ParseUUIDPipe,
    Delete,
} from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";
import { DonationService } from "./donations.service";
import { CreateDonationDto } from "./dto/create-donatio.dto.";
import { Donation } from "./entity/donation.entity";
import { User } from "src/user/entity/user.entity";
import { CurrentUser } from "src/auth/decorator/current-user.decorator";
import { Roles } from "src/auth/decorator/roles.decorator";
import { Role } from "src/user/role.enum";

@Controller("donations")
export class DonationController {
    private readonly logger = new Logger(DonationController.name);
    constructor(private readonly donationService: DonationService) {}

    // 📋 Historial de donaciones del usuario
    @Get()
    @UseGuards(AuthGuard("jwt"))
    findByUser(@CurrentUser() user: User): Promise<Donation[]> {
        return this.donationService.findByUser(user);
    }

    @Get("my/summary")
    getMyDonationsSummary(@Req() req: any) {
        return this.donationService.getUserDonationsSummary(req.user);
    }

    @Get("user/:id/history")
    @UseGuards(AuthGuard("jwt"))
    //@Roles(Role.ADMIN)
    getUserDonations(@Param("id") userId: string) {
        return this.donationService.findByUser({ id: userId } as User);
    }

    // 🔒 Historial mensual (admin)
    @Get("stats/history") // Mantengo el path original por si lo usas con este nombre
    @UseGuards(AuthGuard("jwt"))
    getAllMonthlyDonations(): Promise<{ month: string; total: number }[]> {
        return this.donationService.getAllMonthlyDonations();
    }

    @Post("create_preference")
    @UseGuards(AuthGuard("jwt"))
    async createPreference(
        @Body() dto: CreateDonationDto,
        @CurrentUser() user: User,
    ): Promise<{
        donationId: string;
        checkoutUrl: string;
        preferenceId: string;
    }> {
        const { donation, checkoutUrl, preferenceId } =
            await this.donationService.create(dto, user);
        return { donationId: donation.id, preferenceId, checkoutUrl };
    }

    @Get("stats/total")
    @UseGuards(AuthGuard("jwt"))
    async getTotalDonations(): Promise<{ total: number }> {
        this.logger.log("➤ GET /donations/stats/total invocado");
        const total = await this.donationService.totalDonations();
        this.logger.log(`➤ Total computed: ${total}`);
        return { total };
    }

    @Get("stats/monthly")
    @UseGuards(AuthGuard("jwt"))
    async getMonthlyDonationStats(
        @Query("period") period?: string, // Parámetro de consulta opcional para el número de meses
    ): Promise<{ month: string; total: number; count: number }[]> {
        let nMonths = 6; // Por defecto, los últimos 6 meses

        if (period) {
            const parsedPeriod = parseInt(period, 10);
            // Si el valor es un número válido y positivo, úsalo.
            if (!isNaN(parsedPeriod) && parsedPeriod > 0) {
                nMonths = parsedPeriod;
            } else {
                this.logger.warn(
                    `Parámetro 'period' inválido: ${period}. Usando ${nMonths} meses por defecto.`,
                );
            }
        }
        return this.donationService.getMonthlyDonationsLastNMonths(nMonths);
    }

    @Get("stats/weekly")
    @UseGuards(AuthGuard("jwt"))
    async getWeeklyDonationStats(): Promise<
        { date: string; total: number; count: number }[]
    > {
        return this.donationService.getWeeklyDonationsLast7Days();
    }

    @Get("user/:id/total")
    async getTotalByUser(
        @Param("id", new ParseUUIDPipe()) userId: string,
    ): Promise<{ userId: string; totalDonated: number }> {
        const totalDonated =
            await this.donationService.getTotalDonationsByUser(userId);
        return { userId, totalDonated };
    }

    /**
     * DELETE /donations/cleanup/pre-mercadopago
     * Borra todas las donaciones antiguas que no fueron completadas por MercadoPago.
     */
    @Delete("cleanup/pre-mercadopago")
    @Roles(Role.ADMIN)
    async cleanupOldDonations() {
        const result =
            await this.donationService.removeNonMercadoPagoDonations();
        return {
            deletedCount: result.affected ?? 0,
            message: `${result.affected ?? 0} donaciones pre-MercadoPago eliminadas.`,
        };
    }
}

// MercadoPago
/* @Post("create_preference")
    createPreference(
        @Body()
        { amount, description }: { amount: number; description: string },
    ) {
        return this.donationService.createPreference(amount, description);
    } */

// 🔒 Total de todas las donaciones (admin o público)
/*   @Get("admin/total")
    @UseGuards(AuthGuard("jwt"), RolesGuard)
    @Roles(Role.ADMIN)
    total(): Promise<number> {
        return this.donationService.totalDonations();
    }*/

// 🧑‍💼 Usuario logueado crea una donación
/*  @Post()
    @UseGuards(AuthGuard("jwt"))
    create(@Req() req: any, @Body() dto: CreateDonationDto): Promise<Donation> {
        return this.donationService.create(dto, req.user);
    } */
