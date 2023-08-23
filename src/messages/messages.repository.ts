import { Injectable } from '@nestjs/common';
import { Message } from './message.entity';
import { Repository, DataSource } from 'typeorm';

@Injectable()
export class MessagesRepository extends Repository<Message> {
  constructor(private datasource: DataSource) {
    super(Message, datasource.createEntityManager());
  }

  async findOneByMessageId(messageId: number): Promise<Message> {
    return await this.findOne({ where: { messageId } });
  }

  async findThreeDaysBeforeSend(): Promise<Message[]> {
    const threeDaysAgo = new Date();
    threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);

    return this.createQueryBuilder('message')
      .where('message.createdAt > :threeDaysAgo', { threeDaysAgo })
      .getMany();
  }

  async findTwentyFourHoursBeforeSend(): Promise<Message[]> {
    const twentyFourHoursAgo = new Date();
    twentyFourHoursAgo.setDate(twentyFourHoursAgo.getDate() - 1);

    return this.createQueryBuilder('message')
      .where('message.createdAt > :twentyFourHoursAgo', { twentyFourHoursAgo })
      .getMany();
  }

  async findNotSend(): Promise<Message[]> {
    const twoHoursAgo = new Date();
    twoHoursAgo.setHours(twoHoursAgo.getHours() - 2);

    return this.createQueryBuilder('message')
      .where('message.createdAt < :twoHoursAgo', { twoHoursAgo })
      .andWhere('message.isSent = :status', { status: false })
      .getMany();
  }
}

@Injectable()
export class MessagesContentRepository extends Repository<Message> {
  constructor(private datasource: DataSource) {
    super(Message, datasource.createEntityManager());
  }

  async findOneByMessageId(messageId: number): Promise<Message> {
    return await this.findOne({ where: { messageId } });
  }
}
