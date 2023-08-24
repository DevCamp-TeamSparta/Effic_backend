import { Module } from '@nestjs/common';
import { ResultsController } from './controller/results.controller';
import { ResultsService } from './service/results.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { NcpResult, Result } from './result.entity';
import {
  NcpResultsRepository,
  ResultsRepository,
  UrlResultsRepository,
} from './results.repository';
import { UsersRepository } from 'src/users/users.repository';
import {
  MessageGroupRepo,
  MessagesContentRepository,
  MessagesRepository,
  UrlInfosRepository,
} from 'src/messages/messages.repository';

@Module({
  imports: [TypeOrmModule.forFeature([Result])],
  controllers: [ResultsController],
  providers: [
    ResultsService,
    ResultsRepository,
    UsersRepository,
    NcpResultsRepository,
    UrlResultsRepository,
    MessagesRepository,
    MessagesContentRepository,
    MessageGroupRepo,
    UrlInfosRepository,
  ],
  exports: [
    ResultsService,
    ResultsRepository,
    NcpResultsRepository,
    UrlResultsRepository,
  ],
})
export class ResultsModule {}
