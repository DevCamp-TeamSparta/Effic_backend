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
}
