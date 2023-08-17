import { Injectable } from '@nestjs/common';
import { Message } from './message.entity';
import { Repository, DataSource } from 'typeorm';
import { DefaultResultDto } from './dto/default-result.dto';

@Injectable()
export class MessagesRepository extends Repository<Message> {
  constructor(private datasource: DataSource) {
    super(Message, datasource.createEntityManager());
  }

  async findOneByMessageId(messageId: number): Promise<Message> {
    return await this.findOne({ where: { messageId } });
  }

  async findOlderThanTwentyFourHours(): Promise<Message[]> {
    const twentyFourHoursAgo = new Date();
    twentyFourHoursAgo.setDate(twentyFourHoursAgo.getDate() - 1);

    return this.createQueryBuilder('message')
      .where('message.createdAt < :twentyFourHoursAgo', { twentyFourHoursAgo })
      .getMany();
  }

  async findOlderThanThreeDays(): Promise<Message[]> {
    const threeDaysAgo = new Date();
    threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);

    return this.createQueryBuilder('message')
      .where('message.createdAt < :threeDaysAgo', { threeDaysAgo })
      .getMany();
  }
}
