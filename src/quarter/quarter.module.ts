import { Module } from '@nestjs/common';
import { QuarterController} from './quarter.controller';
import { QuarterService } from './quarter.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Quarter } from './entities/quarter.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Quarter])],
  controllers: [QuarterController],
  providers: [QuarterService]
})
export class QuarterModule {}
