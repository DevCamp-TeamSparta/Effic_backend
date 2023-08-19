import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MessagesController } from './controller/messages.controller';
import { MessagesService } from './service/messages.service';
import { Message } from './message.entity';
import { UsersRepository } from 'src/users/users.repository';
import { MessagesRepository } from './messages.repository';

@Module({
  imports: [TypeOrmModule.forFeature([Message])],
  controllers: [MessagesController],
  providers: [MessagesService, MessagesRepository, UsersRepository],
  exports: [MessagesService, MessagesRepository],
})
export class MessageModule {}
