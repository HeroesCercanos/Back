import {
    Controller,
    Post,
    Get,
    Patch,
    Body,
    Param,
    ParseIntPipe,
    Req,
    UseGuards,
    ParseUUIDPipe,
} from "@nestjs/common";
import { IncidentService } from "./incidents.service";
import { CreateIncidentDto } from "./dto/create-incident.dto";
import { AdminActionDto } from "./dto/admin-action.dto";
import {
    Incident,
    IncidentStatus,
    IncidentType,
} from "./entity/incident.entity";
import { AuthGuard } from "@nestjs/passport";
import IncidentHistory from "./entity/incident-history.entity";
import { ReportMetrics } from "./interface/incidents.interface";
import { Role } from "src/user/role.enum";
import { RolesGuard } from "src/auth/guards/google-auth/roles.guard";
import { JwtAuthGuard } from "src/auth/jwt-auth.guard";

@Controller("incident")
export class IncidentController {
    constructor(private readonly incidentService: IncidentService) {}

    // 🧑‍💼 Crear incidente (user o admin logueado)
    @Post()
    @UseGuards(AuthGuard("jwt"))
    create(@Req() req: any, @Body() dto: CreateIncidentDto): Promise<Incident> {
        console.log("Usuario autenticado:", req.user);
        return this.incidentService.create(dto, req.user);
    }

    // 📋 Ver todos los incidentes (admin)
    @Get()
    @UseGuards(AuthGuard("jwt"))
    findAll(): Promise<Incident[]> {
        return this.incidentService.findAll();
    }

    @Get("history")
    getHistory(): Promise<IncidentHistory[]> {
        return this.incidentService.getHistory();
    }

    @Get(":id/history")
    getIncidentHistory(@Param("id") id: string): Promise<IncidentHistory[]> {
        return this.incidentService.getIncidentHistory(id);
    }

    // 🛠️ Admin marca como asistido o eliminado y agrega info
    @Patch("admin/:id")
    updateIncidentByAdmin(
        @Param("id") id: string,
        @Body() dto: AdminActionDto,
    ): Promise<Incident> {
        return this.incidentService.updateByAdmin(id, dto);
    }

    @Patch(":id/status")
    async updateStatus(
        @Param("id", new ParseUUIDPipe()) id: string,
        @Body("status") status: IncidentStatus,
    ) {
        // aquí pasás 'true' para adminOverride
        return this.incidentService.updateStatus(id, status, true);
    }

    @Get("metrics/total")
    getTotal(): Promise<number> {
        return this.incidentService.getTotalReports();
    }

    @Get("metrics/weekly")
    getWeekly(): Promise<{ week: Date; count: number }[]> {
        return this.incidentService.getWeeklyReports();
    }

    @Get("metrics/monthly")
    getMonthly(): Promise<{ month: Date; count: number }[]> {
        return this.incidentService.getMonthlyReports();
    }

    @Get("metrics/status")
    getByStatus(): Promise<{ status: IncidentStatus; count: number }[]> {
        return this.incidentService.getReportsByStatus();
    }

    @Get("metrics/type")
    getByType(): Promise<{ type: IncidentType; count: number }[]> {
        return this.incidentService.getReportsByType();
    }

    @Get("user/:id/count")
    async countByUser(
        @Param("id", new ParseUUIDPipe()) userId: string,
    ): Promise<{ userId: string; totalReports: number }> {
        const totalReports = await this.incidentService.countByUser(userId);
        return { userId, totalReports };
    }
}
