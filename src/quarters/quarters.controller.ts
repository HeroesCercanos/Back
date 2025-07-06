import { Controller, Get } from '@nestjs/common';
import { QuartersService } from './quarters.service';

@Controller('quarters')
export class QuartersController {
constructor(private readonly quartersService: QuartersService) {}
    @Get()
    findAll(){
        return this.quartersService.findAll(); ;
    }




}
