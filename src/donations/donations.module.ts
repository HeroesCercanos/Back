// src/donation/donation.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PassportModule } from '@nestjs/passport';
import { DonationController } from './donations.controller'; 
import { DonationService } from './donations.service'; 
import { Donation } from './entity/donation.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Donation]),
    // Necesario para usar AuthGuard('jwt') en el controller
    PassportModule.register({ defaultStrategy: 'jwt' }),
  ],
  controllers: [DonationController],
  providers: [DonationService],
  exports: [DonationService],
})
export class DonationModule {}
