import { Module } from '@nestjs/common';
import { QuartersController } from './quarters.controller';
import { QuartersService } from './quarters.service';

@Module({
  controllers: [QuartersController],
  providers: [QuartersService]
})
export class QuartersModule {}
