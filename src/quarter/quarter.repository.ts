// src/quarters/quarter.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Quarter } from '../quarter/entities/quarter.entity';

@Injectable()
export class QuarterRepository {
  constructor(
    @InjectRepository(Quarter)
    private readonly quarterRepository: Repository<Quarter>,
  ) {}

  async findOne(id: number): Promise<Quarter> {
  const quarter = await this.quarterRepository.findOneBy({ id });
  if (!quarter) {
    throw new NotFoundException('Cuartel no encontrado');
  }
  return quarter;
}

  async findAll(): Promise<Quarter[]> {
    return this.quarterRepository.find();
  }
}
