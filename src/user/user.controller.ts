import {
    BadRequestException,
    Body,
    Controller,
    Delete,
    Get,
    HttpCode,
    HttpStatus,
    Logger,
    NotFoundException,
    Param,
    ParseIntPipe,
    ParseUUIDPipe,
    Patch,
    Post,
    Put,
    Query,
    Req,
    UseGuards,
} from "@nestjs/common";
import { UserService } from "./user.service";
import { User } from "./entity/user.entity";
import { AuthGuard } from "@nestjs/passport";
import { UpdateUserDto } from "src/auth/dto/update-user.dto";
import { Roles } from "src/auth/decorator/roles.decorator";
import { RolesGuard } from "src/auth/guards/google-auth/roles.guard";
import { Role } from "./role.enum";
import { ChangePasswordDto } from "src/auth/dto/change-password.dto";
import { UpdateActiveDto } from "src/auth/dto/update-active.dto";
import { UpdateRoleDto } from "src/auth/dto/update-role.dto";

@Controller("users")
export class UserController {
    private readonly logger = new Logger(UserService.name);
    constructor(private readonly userService: UserService) {}

    @Get()
    async getAll(): Promise<User[]> {
        return this.userService.findAll();
    }

    @Post()
    @HttpCode(HttpStatus.CREATED)
    async create(@Body() data: Partial<User>): Promise<User> {
        return this.userService.create(data);
    }

    @Post("me/location")
    @UseGuards(AuthGuard("jwt"))
    updateLocation(
        @Req() req,
        @Body() dto: { latitude: number; longitude: number },
    ) {
        return this.userService.update(req.user.sub, dto);
    }

    @Get(":id")
    async findOne(
        @Param("id")
        id: string,
    ): Promise<User> {
        const user = await this.userService.findById(id);

        if (!user) {
            throw new NotFoundException(`User with ID ${id} not found.`);
        }

        return user;
    }

    @Delete(":id")
    remove(@Param("id") id: string): Promise<void> {
        return this.userService.remove(id);
    }

    @Patch(":id")
    updateUser(
        @Param("id", ParseIntPipe) id: string,
        @Body() updateUserDto: UpdateUserDto,
    ): Promise<User> {
        return this.userService.update(id, updateUserDto);
    }

    @Get("stats/total")
    @UseGuards(AuthGuard("jwt"), RolesGuard)
    @Roles(Role.ADMIN)
    async getTotalUsersCount(): Promise<{ total: number }> {
        const total = await this.userService.getTotalUsers();
        return { total };
    }

    // Altas de usuarios por semana (últimos N días)
    // Rutas:
    // - GET /users/stats/registrations/daily?period=7 (por defecto, últimos 7 días)
    // - GET /users/stats/registrations/daily?period=30 (últimos 30 días)
    @Get("stats/registrations/daily")
    @UseGuards(AuthGuard("jwt"), RolesGuard)
    @Roles(Role.ADMIN)
    async getDailyRegistrationsStats(
        @Query("period") period?: string, // Parámetro de consulta opcional para el número de días
    ): Promise<{ date: string; count: number }[]> {
        let nDays = 7; // Por defecto, los últimos 7 días

        if (period) {
            const parsedPeriod = parseInt(period, 10);
            if (!isNaN(parsedPeriod) && parsedPeriod > 0) {
                nDays = parsedPeriod;
            } else {
                this.logger.warn(
                    `Parámetro 'period' inválido para daily registrations: ${period}. Usando ${nDays} días por defecto.`,
                );
            }
        }
        return this.userService.getUserRegistrationsLastNDays(nDays);
    }

    // Altas de usuarios por mes (últimos N meses o todo el historial)
    // Rutas:
    // - GET /users/stats/registrations/monthly?period=6 (por defecto, últimos 6 meses)
    // - GET /users/stats/registrations/monthly?period=12 (últimos 12 meses)
    // - GET /users/stats/registrations/monthly?period=all (todo el historial mensual)
    @Get("stats/registrations/monthly")
    @UseGuards(AuthGuard("jwt"), RolesGuard)
    @Roles(Role.ADMIN)
    async getMonthlyRegistrationsStats(
        @Query("period") period?: string, // Parámetro de consulta opcional
    ): Promise<{ month: string; count: number }[]> {
        if (period && period.toLowerCase() === "all") {
            return this.userService.getAllUserRegistrationsMonthly();
        }

        let nMonths = 6; // Por defecto, los últimos 6 meses
        if (period) {
            const parsedPeriod = parseInt(period, 10);
            if (!isNaN(parsedPeriod) && parsedPeriod > 0) {
                nMonths = parsedPeriod;
            } else {
                this.logger.warn(
                    `Parámetro 'period' inválido para monthly registrations: ${period}. Usando ${nMonths} meses por defecto.`,
                );
            }
        }
        return this.userService.getUserRegistrationsLastNMonths(nMonths);
    }
    @Patch("password")
    async updatePassword(@Req() req: any, @Body() dto: ChangePasswordDto) {
        // (opcional) validar dto.newPassword === dto.confirmPassword
        if (dto.newPassword !== dto.confirmPassword) {
            throw new BadRequestException("Las contraseñas no coinciden");
        }

        await this.userService.changePassword(req.user.id, dto.newPassword);
        return { message: "Contraseña actualizada" };
    }

    /** PATCH /users/:id/active — admin desactiva/reactiva a otro usuario */
    @Patch(":id/active")
    @Roles(Role.ADMIN)
    async updateUserActive(
        @Param("id") id: string,
        @Body() dto: UpdateActiveDto,
    ) {
        return this.userService.setActiveStatus(id, dto.isActive);
    }

    /**
     * PATCH /users/:id/role
     * Solo administradores pueden cambiar el rol de un usuario
     */
    @Patch(":id/role")
    @Roles(Role.ADMIN)
    async changeRole(
        @Param("id") id: string,
        @Body() dto: UpdateRoleDto,
    ): Promise<User> {
        return this.userService.setUserRole(id, dto.role);
    }

    @Patch("users/:id/ban")
    @UseGuards(RolesGuard)
    @Roles(Role.ADMIN)
    async banUser(@Param("id", new ParseUUIDPipe()) id: string) {
        return this.userService.banearUsuario(id);
    }
}
