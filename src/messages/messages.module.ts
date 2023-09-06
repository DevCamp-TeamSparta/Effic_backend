import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MessagesController } from './controller/messages.controller';
import { MessagesService } from './service/messages.service';
import { Message, MessageGroup, TlyUrlInfo, UrlInfo } from './message.entity';
import { UsersRepository } from 'src/users/users.repository';
import {
  MessagesRepository,
  MessagesContentRepository,
  UrlInfosRepository,
  MessageGroupRepo,
} from './messages.repository';
import { ResultsService } from 'src/results/service/results.service';
import { UrlResultsRepository } from 'src/results/results.repository';
import { NcpResultsRepository } from 'src/results/results.repository';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Message,
      MessageGroup,
      MessageGroupRepo,
      UrlInfo,
      TlyUrlInfo,
    ]),
  ],
  controllers: [MessagesController],
  providers: [
    MessagesService,
    MessagesRepository,
    ResultsService,
    UsersRepository,
    UrlInfosRepository,
    UrlResultsRepository,
    NcpResultsRepository,
    MessagesContentRepository,
    MessageGroupRepo,
  ],
  exports: [
    MessagesService,
    MessagesRepository,
    UrlInfosRepository,
    MessagesContentRepository,
    MessageGroupRepo,
  ],
})
export class MessageModule {}
