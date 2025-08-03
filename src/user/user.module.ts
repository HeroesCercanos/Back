import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { User } from './entity/user.entity';// ajustá si lo movés
import { MailModule } from 'src/mail/mail.module';
import { BansModule } from 'src/bans/ban.module';
import { Donation } from 'src/donations/entity/donation.entity';
import { DonationModule } from 'src/donations/donations.module';
import Incident from 'src/incidents/entity/incident.entity';

@Module({
  imports: [TypeOrmModule.forFeature([User, Donation, Incident]), MailModule, BansModule],
  controllers: [UserController],
  providers: [UserService],
  exports: [UserService], // importante para usarlo en auth.module
})
export class UserModule {}
