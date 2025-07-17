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
} from "@nestjs/common";
import { IncidentService } from "./incidents.service";
import { CreateIncidentDto } from "./dto/create-incident.dto";
import { AdminActionDto } from "./dto/admin-action.dto";
import { Incident } from "./entity/incident.entity";
import { AuthGuard } from "@nestjs/passport";
import IncidentHistory from "./entity/incident-history.entity";

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
    @UseGuards(AuthGuard("jwt"))
    getHistory(): Promise<IncidentHistory[]> {
        return this.incidentService.getHistory();
    }

    @Get(":id/history")
    @UseGuards(AuthGuard("jwt"))
    getIncidentHistory(@Param("id") id: string): Promise<IncidentHistory[]> {
        return this.incidentService.getIncidentHistory(id);
    }

    // 🛠️ Admin marca como asistido o eliminado y agrega info
    @Patch("admin/:id")
    @UseGuards(AuthGuard("jwt"))
    updateIncidentByAdmin(
        @Param("id") id: string,
        @Body() dto: AdminActionDto,
    ): Promise<Incident> {
        return this.incidentService.updateByAdmin(id, dto);
    }
}
