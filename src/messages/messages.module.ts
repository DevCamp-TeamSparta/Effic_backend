import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MessagesController } from './controller/messages.controller';
import { MessagesService } from './service/messages.service';
import { Message, MessageGroup } from './message.entity';
import { UsersRepository } from 'src/users/users.repository';
import {
  MessagesRepository,
  MessagesContentRepository,
  UrlInfosRepository,
  MessageGroupRepo,
} from './messages.repository';

@Module({
  imports: [
    TypeOrmModule.forFeature([Message, MessageGroup, MessageGroupRepo]),
  ],
  controllers: [MessagesController],
  providers: [
    MessagesService,
    MessagesRepository,
    UsersRepository,
    UrlInfosRepository,
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
