import { Module } from '@nestjs/common';
import { ResultsController } from './controller/results.controller';
import { ResultsService } from './service/results.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Result } from './result.entity';
import { ResultsRepository } from './results.repository';
import { UsersRepository } from 'src/users/users.repository';
import { MessagesRepository } from 'src/messages/messages.repository';

@Module({
  imports: [TypeOrmModule.forFeature([Result])],
  controllers: [ResultsController],
  providers: [
    ResultsService,
    ResultsRepository,
    UsersRepository,
    MessagesRepository,
  ],
  exports: [ResultsService, ResultsRepository],
})
export class ResultsModule {}
