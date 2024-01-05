import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MessagesController } from './controller/messages.controller';
import { MessagesService } from './service/messages.service';
import { Message, MessageGroup } from './message.entity';
import {
  UserNcpInfoRepository,
  UsersRepository,
} from 'src/users/users.repository';
import {
  MessagesRepository,
  MessagesContentRepository,
  MessageGroupRepo,
  AdvertiseReceiverListRepository,
} from './messages.repository';
import { ResultsService } from 'src/results/service/results.service';
import { UrlResultsRepository } from 'src/results/repository/results.repository';
import { NcpResultsRepository } from 'src/results/repository/results.repository';
import { UsersService } from 'src/users/service/users.service';
import { ShorturlService } from 'src/shorturl/service/shorturl.service';
import { UrlInfosRepository } from 'src/shorturl/shorturl.repository';
import { SegmentModule } from 'src/segment/segment.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Message, MessageGroup, MessageGroupRepo]),
    SegmentModule,
  ],
  controllers: [MessagesController],
  providers: [
    MessagesService,
    MessagesRepository,
    ResultsService,
    UsersService,
    UsersRepository,
    UserNcpInfoRepository,
    UrlResultsRepository,
    NcpResultsRepository,
    MessagesContentRepository,
    MessageGroupRepo,
    AdvertiseReceiverListRepository,
    ShorturlService,
    UrlInfosRepository,
  ],
  exports: [
    MessagesService,
    MessagesRepository,
    MessagesContentRepository,
    MessageGroupRepo,
    AdvertiseReceiverListRepository,
  ],
})
export class MessageModule {}
