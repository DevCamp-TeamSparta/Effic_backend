import { Module } from '@nestjs/common';
import { BizmessageController } from './controller/bizmessage.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BizmessageService } from './service/bizmessage.service';
import { BizmessageRepository } from './bizmessage.repository';
import { Bizmessage } from './bizmessage.entity';
import { UsersService } from 'src/users/service/users.service';
import {
  UserNcpInfoRepository,
  UsersRepository,
} from 'src/users/users.repository';

@Module({
  imports: [TypeOrmModule.forFeature([Bizmessage])],
  controllers: [BizmessageController],
  providers: [
    BizmessageService,
    BizmessageRepository,
    UsersService,
    UsersRepository,
    UserNcpInfoRepository,
  ],
  exports: [BizmessageService, BizmessageRepository],
})
export class BizmessageModule {}
