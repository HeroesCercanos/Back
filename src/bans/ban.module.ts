import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Ban } from './entity/ban.entity'; 
import { BanService } from './ban.service';
import { User } from 'src/user/entity/user.entity';
import { MailModule } from 'src/mail/mail.module';

@Module({
  imports: [TypeOrmModule.forFeature([Ban, User]), MailModule],
  providers: [BanService],
  exports: [BanService],
})
export class BansModule {}
