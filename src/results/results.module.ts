import { Module } from '@nestjs/common';
import { ResultsController } from './controller/results.controller';
import { ResultsService } from './service/results.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { NcpResult, UrlResult } from './result.entity';
import {
  NcpResultsRepository,
  UrlResultsRepository,
} from './results.repository';
import { UsersRepository } from 'src/users/users.repository';
import {
  MessageGroupRepo,
  MessagesRepository,
  UrlInfosRepository,
  MessagesContentRepository,
} from 'src/messages/messages.repository';
import { TlyUrlInfo, UrlInfo } from 'src/messages/message.entity';
import { MessagesService } from 'src/messages/service/messages.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([NcpResult, UrlResult, UrlInfo, TlyUrlInfo]),
  ],
  controllers: [ResultsController],
  providers: [
    ResultsService,
    MessagesService,
    UsersRepository,
    NcpResultsRepository,
    UrlResultsRepository,
    MessagesRepository,
    MessageGroupRepo,
    UrlInfosRepository,
    MessagesContentRepository,
  ],
  exports: [ResultsService, NcpResultsRepository, UrlResultsRepository],
})
export class ResultsModule {}
