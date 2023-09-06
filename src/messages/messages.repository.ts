import { Injectable } from '@nestjs/common';
import {
  Message,
  MessageContent,
  MessageGroup,
  UrlInfo,
} from './message.entity';
import { Repository, DataSource } from 'typeorm';

@Injectable()
export class MessagesRepository extends Repository<Message> {
  constructor(private datasource: DataSource) {
    super(Message, datasource.createEntityManager());
  }
  async findAllByMessageGroupId(messageGroupId: number) {
    return await this.find({ where: { messageGroupId } });
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

  async findNotSend(): Promise<Message[]> {
    const twoHoursAgo = new Date();
    twoHoursAgo.setHours(twoHoursAgo.getHours() - 2);

    return this.createQueryBuilder('message')
      .where('message.createdAt < :twoHoursAgo', { twoHoursAgo })
      .andWhere('message.isSent = :status', { status: false })
      .getMany();
  }

  async findThreeDaysBeforeSendAndNotChecked(): Promise<Message[]> {
    const threeDaysAgo = new Date();
    threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);

    return this.createQueryBuilder('message')
      .where('message.createdAt < :threeDaysAgo', { threeDaysAgo })
      .andWhere('message.isMoneyCheck = :status', { status: false })
      .getMany();
  }
}

@Injectable()
export class MessagesContentRepository extends Repository<MessageContent> {
  constructor(private datasource: DataSource) {
    super(MessageContent, datasource.createEntityManager());
  }

  async findOneByMessageId(messageId: number): Promise<MessageContent> {
    return await this.findOne({ where: { messageId } });
  }
}

@Injectable()
export class UrlInfosRepository extends Repository<UrlInfo> {
  constructor(private datasource: DataSource) {
    super(UrlInfo, datasource.createEntityManager());
  }

  async findOneByIdString(idString: string): Promise<UrlInfo> {
    return await this.findOne({
      where: { idString },
      relations: {
        tlyUrlInfo: true,
      },
    });
  }
}

@Injectable()
export class MessageGroupRepo extends Repository<MessageGroup> {
  constructor(private datasource: DataSource) {
    super(MessageGroup, datasource.createEntityManager());
  }

  async findOneByMessageGroupId(messageGroupId: number) {
    return await this.findOne({ where: { id: messageGroupId } });
  }

  async findAllByUserId(userId: number): Promise<MessageGroup[]> {
    return await this.createQueryBuilder('messageGroup')
      .leftJoinAndSelect('messageGroup.messages', 'message')
      .where('messageGroup.userId = :userId', { userId })
      .getMany();
  }

  async createMessageGroup(userId: number): Promise<MessageGroup> {
    const messageGroup = new MessageGroup();
    messageGroup.userId = userId;
    return await this.save(messageGroup);
  }
}
