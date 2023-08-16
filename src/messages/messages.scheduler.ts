import { Injectable } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { MessagesService } from './service/messages.service';

@Injectable()
export class MessagesScheduler {
  constructor(private readonly messagesService: MessagesService) {}

  @Cron(CronExpression.EVERY_10_MINUTES)
  async sendScheduledMessages() {
    //ncp 결과값 호출
    //short.io 결과값 호출
  }
}
