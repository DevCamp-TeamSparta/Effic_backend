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

@Module({
  imports: [TypeOrmModule.forFeature([NcpResult, UrlResult])],
  controllers: [ResultsController],
  providers: [
    ResultsService,
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
