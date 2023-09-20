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
  UrlInfosRepository,
  MessageGroupRepo,
  AdvertiseReceiverListRepository,
} from './messages.repository';
import { ResultsService } from 'src/results/service/results.service';
import { UrlResultsRepository } from 'src/results/results.repository';
import { NcpResultsRepository } from 'src/results/results.repository';
import { UsersService } from 'src/users/service/users.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Message, MessageGroup, MessageGroupRepo]),
  ],
  controllers: [MessagesController],
  providers: [
    MessagesService,
    MessagesRepository,
    ResultsService,
    UsersService,
    UsersRepository,
    UserNcpInfoRepository,
    UrlInfosRepository,
    UrlResultsRepository,
    NcpResultsRepository,
    MessagesContentRepository,
    MessageGroupRepo,
    AdvertiseReceiverListRepository,
  ],
  exports: [
    MessagesService,
    MessagesRepository,
    UrlInfosRepository,
    MessagesContentRepository,
    MessageGroupRepo,
    AdvertiseReceiverListRepository,
  ],
})
export class MessageModule {}
