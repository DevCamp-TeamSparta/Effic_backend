import { Module } from '@nestjs/common';
import { ResultsController } from './controller/results.controller';
import { ResultsService } from './service/results.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { NcpResult, UrlResult } from './result.entity';
import {
  NcpResultsRepository,
  UrlResultsRepository,
} from './results.repository';
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
    MessagesRepository,
    MessageGroupRepo,
    MessagesContentRepository,
    AdvertiseReceiverListRepository,
    UrlInfosRepository,
    ShorturlService,
  ],
  exports: [ResultsService, NcpResultsRepository, UrlResultsRepository],
})
export class ResultsModule {}
