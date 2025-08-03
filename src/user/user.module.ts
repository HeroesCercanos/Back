import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { User } from './entity/user.entity';// ajustá si lo movés
import { MailModule } from 'src/mail/mail.module';
import { BansModule } from 'src/bans/ban.module';

@Module({
  imports: [TypeOrmModule.forFeature([User]), MailModule, BansModule],
  controllers: [UserController],
  providers: [UserService],
  exports: [UserService], // importante para usarlo en auth.module
})
export class UserModule {}
