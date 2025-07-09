import { Module } from '@nestjs/common';
import { QuarterController} from './quarter.controller';
import { QuarterService } from './quarter.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Quarter } from './entity/quarter.entity';
import { QuarterRepository } from './quarter.repository';

@Module({
  imports: [TypeOrmModule.forFeature([Quarter])],
  controllers: [QuarterController],
  providers: [QuarterService, QuarterRepository]
})
export class QuarterModule {}
