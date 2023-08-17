import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MessagesController } from './controller/messages.controller';
import { MessagesService } from './service/messages.service';
import { Message } from './message.entity';
import { UsersRepository } from 'src/users/users.repository';
import { MessagesRepository } from './messages.repository';
import { UsersService } from 'src/users/service/users.service';
import { DefaultSchedulerService } from 'src/schedulers/defualt-message-scheduler.schedule';

@Module({
  imports: [TypeOrmModule.forFeature([Message])],
  controllers: [MessagesController],
  providers: [
    MessagesService,
    MessagesRepository,
    UsersRepository,
    UsersService,
    DefaultSchedulerService,
  ],
  exports: [MessagesService, MessagesRepository, DefaultSchedulerService],
})
export class MessageModule {}
