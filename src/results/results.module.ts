import { Module } from '@nestjs/common';
import { ResultsController } from './controller/results.controller';
import { ResultsService } from './service/results.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { NcpResult, UrlResult } from './entity/result.entity';
import {
  NcpResultsRepository,
  UrlResultsRepository,
} from './repository/results.repository';
import {
  UsersRepository,
  UserNcpInfoRepository,
} from 'src/users/users.repository';
import {
  MessageGroupRepo,
  MessagesRepository,
  MessagesContentRepository,
  AdvertiseReceiverListRepository,
} from 'src/messages/messages.repository';
import { MessagesService } from 'src/messages/service/messages.service';
import { UsersService } from 'src/users/service/users.service';
import { UrlInfosRepository } from 'src/shorturl/shorturl.repository';
import { ShorturlService } from 'src/shorturl/service/shorturl.service';
import { BizmessageResultsService } from './service/biz-results.service';
import {
  BizmessageNcpResultsRepository,
  BizmessageUrlResultRepository,
} from './repository/biz-result.repository';
import { BizmessageService } from 'src/bizmessage/service/bizmessage.service';
import {
  BizmessageContentRepository,
  BizmessageGroupRepository,
  BizmessageRepository,
} from 'src/bizmessage/bizmessage.repository';

@Module({
  imports: [TypeOrmModule.forFeature([NcpResult, UrlResult])],
  controllers: [ResultsController],
  providers: [
    ResultsService,
    MessagesService,
    UsersService,
    UsersRepository,
    UserNcpInfoRepository,
    NcpResultsRepository,
    UrlResultsRepository,
    BizmessageService,
    BizmessageResultsService,
    BizmessageNcpResultsRepository,
    BizmessageGroupRepository,
    BizmessageContentRepository,
    BizmessageRepository,
    BizmessageUrlResultRepository,
    MessagesRepository,
    MessageGroupRepo,
    MessagesContentRepository,
    AdvertiseReceiverListRepository,
    UrlInfosRepository,
    ShorturlService,
  ],
  exports: [
    ResultsService,
    NcpResultsRepository,
    UrlResultsRepository,
    BizmessageResultsService,
    BizmessageNcpResultsRepository,
    BizmessageUrlResultRepository,
  ],
})
export class ResultsModule {}
