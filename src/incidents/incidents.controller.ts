import { Controller, Get, Post, Body, Param, Patch, Delete, Req } from '@nestjs/common';
import { Request } from 'express';
import { IncidentService } from './incidents.service'; 
import { CreateIncidentDto } from './dto/create-incident.dto';
import { UpdateIncidentDto } from './dto/update-incident.dto';
import { AdminActionDto } from './dto/admin-action.dto';

@Controller('incidents')
export class IncidentController {
  constructor(private readonly incidentService: IncidentService) {}

  @Post()
  create(@Body() createDto: CreateIncidentDto) {
    return this.incidentService.create(createDto);
  }

  @Get()
  findAll() {
    return this.incidentService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.incidentService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateDto: UpdateIncidentDto) {
    return this.incidentService.update(+id, updateDto);
  }

  @Patch(':id/admin-action')
  applyAdminAction(
    @Param('id') id: string,
    @Body() actionDto: AdminActionDto,
    @Req() req: Request,
  ) {
    // Si usas JWT, puedes obtener el ID del admin con req.user.id
    if (!actionDto.adminId && (req as any).user) {
      actionDto.adminId = (req as any).user.id;
    }
    return this.incidentService.applyAdminAction(+id, actionDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.incidentService.remove(+id);
  }
}