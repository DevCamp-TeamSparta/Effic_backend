import { Module } from '@nestjs/common';
import { BizmessageController } from './controller/bizmessage.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BizmessageService } from './service/bizmessage.service';
import {
  BizmessageAdReceiverListRepository,
  BizmessageContentRepository,
  BizmessageGroupRepository,
  BizmessageImageInfoRepository,
  BizmessageRepository,
} from './bizmessage.repository';
import { Bizmessage, BizmessageGroup } from './bizmessage.entity';
import { UsersService } from 'src/users/service/users.service';
import {
  UserNcpInfoRepository,
  UsersRepository,
} from 'src/users/users.repository';
import { ShorturlService } from 'src/shorturl/service/shorturl.service';
import { UrlInfosRepository } from 'src/shorturl/shorturl.repository';

@Module({
  imports: [TypeOrmModule.forFeature([Bizmessage, BizmessageGroup])],
  controllers: [BizmessageController],
  providers: [
    BizmessageService,
    BizmessageRepository,
    BizmessageGroupRepository,
    BizmessageContentRepository,
    BizmessageAdReceiverListRepository,
    BizmessageImageInfoRepository,
    UsersService,
    UsersRepository,
    UserNcpInfoRepository,
    ShorturlService,
    UrlInfosRepository,
  ],
  exports: [
    BizmessageService,
    BizmessageRepository,
    BizmessageGroupRepository,
    BizmessageContentRepository,
    BizmessageAdReceiverListRepository,
    BizmessageImageInfoRepository,
  ],
})
export class BizmessageModule {}
