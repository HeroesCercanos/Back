import { Controller, Get } from '@nestjs/common';
import { QuarterService } from './quarter.service';

@Controller('quarter')
export class QuarterController {
constructor(private readonly quarterService: QuarterService) {}
    @Get()
    findAll(){
        return this.quarterService.findAll(); ;
    }




}
