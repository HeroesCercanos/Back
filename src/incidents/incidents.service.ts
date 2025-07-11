import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Incident } from './entity/incident.entity/incident.entity'; 
import { CreateIncidentDto } from './dto/create-incident.dto';
import { UpdateIncidentDto } from './dto/update-incident.dto';
import { AdminActionDto } from './dto/admin-action.dto';

@Injectable()
export class IncidentService {
  constructor(
    @InjectRepository(Incident)
    private readonly incidentRepository: Repository<Incident>,
  ) {}

  async create(createDto: CreateIncidentDto): Promise<Incident> {
    const incident = this.incidentRepository.create(createDto);
    return this.incidentRepository.save(incident);
  }

  findAll(): Promise<Incident[]> {
    return this.incidentRepository.find({ relations: ['reporter', 'admin'] });
  }

  async findOne(id: number): Promise<Incident> {
    const incident = await this.incidentRepository.findOne({
      where: { id },
      relations: ['reporter', 'admin'],
    });
    if (!incident) throw new NotFoundException(`Incident with id ${id} not found`);
    return incident;
  }

  async update(id: number, updateDto: UpdateIncidentDto): Promise<Incident> {
    await this.findOne(id);
    await this.incidentRepository.update(id, updateDto);
    return this.findOne(id);
  }

  async remove(id: number): Promise<void> {
    const incident = await this.findOne(id);
    await this.incidentRepository.remove(incident);
  }

  async applyAdminAction(
    id: number,
    actionDto: AdminActionDto,
  ): Promise<Incident> {
    const incident = await this.findOne(id);
    incident.action = actionDto.action;
    incident.adminCommentary = actionDto.adminCommentary;
    if (actionDto.adminId !== undefined) {
      incident.adminId = actionDto.adminId;
    }
    return this.incidentRepository.save(incident);
  }
}
