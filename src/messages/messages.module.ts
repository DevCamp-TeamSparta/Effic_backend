import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MessagesController } from './controller/messages.controller';
import { MessagesService } from './service/messages.service';
import { Message } from './message.entity';
import { UsersRepository } from 'src/users/users.repository';
import { MessagesRepository } from './messages.repository';
import { UsersService } from 'src/users/service/users.service';
import { MessagesScheduler } from './messages.scheduler';

@Module({
  imports: [TypeOrmModule.forFeature([Message])],
  controllers: [MessagesController],
  providers: [
    MessagesService,
    MessagesRepository,
    UsersRepository,
    UsersService,
    MessagesScheduler,
  ],
  exports: [MessagesService, MessagesRepository],
})
export class MessageModule {}
