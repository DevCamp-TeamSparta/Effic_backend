import { Injectable } from '@nestjs/common';
import { Repository, DataSource } from 'typeorm';
import {
  Bizmessage,
  BizmessageAdReceiverList,
  BizmessageContent,
  BizmessageGroup,
  BizmessageImageInfo,
} from './bizmessage.entity';

@Injectable()
export class BizmessageRepository extends Repository<Bizmessage> {
  constructor(private datasource: DataSource) {
    super(Bizmessage, datasource.createEntityManager());
  }

  async findOneByBizmessageId(bizmessageId: number): Promise<Bizmessage> {
    return await this.findOne({ where: { bizmessageId } });
  }

  async findThreeDaysBeforeSend(): Promise<Bizmessage[]> {
    const threeDaysAgo = new Date();
    threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);

    return this.createQueryBuilder('bizmessage')
      .where('bizmessage.createdAt > :threeDaysAgo', { threeDaysAgo })
      .getMany();
  }

  async findNotSend(): Promise<Bizmessage[]> {
    const twoHoursAgo = new Date();
    twoHoursAgo.setHours(twoHoursAgo.getHours() - 2);

    return this.createQueryBuilder('bizmessage')
      .where('bizmessage.createdAt < :twoHoursAgo', { twoHoursAgo })
      .andWhere('bizmessage.isSent = :status', { status: false })
      .getMany();
  }

  async findThreeDaysBeforeSendAndNotChecked(): Promise<Bizmessage[]> {
    const threeDaysAgo = new Date();
    threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);

    return this.createQueryBuilder('bizmessage')
      .where('bizmessage.createdAt < :threeDaysAgo', { threeDaysAgo })
      .andWhere('bizmessage.isMoneyCheck = :status', { status: false })
      .getMany();
  }

  async findAllByBizmessageGroupId(
    bizmessageGroupId: number,
  ): Promise<Bizmessage[]> {
    return await this.find({ where: { bizmessageGroupId } });
  }
}

@Injectable()
export class BizmessageGroupRepository extends Repository<BizmessageGroup> {
  constructor(private datasource: DataSource) {
    super(BizmessageGroup, datasource.createEntityManager());
  }

  async createBizmessageGroup(userId: number): Promise<BizmessageGroup> {
    const bizmessageGroup = new BizmessageGroup();
    bizmessageGroup.userId = userId;
    return await this.save(bizmessageGroup);
  }

  async findAllBizmessageGroupByUserId(userId: number): Promise<any> {
    return await this.find({ where: { userId } });
  }
}

@Injectable()
export class BizmessageContentRepository extends Repository<BizmessageContent> {
  constructor(private datasource: DataSource) {
    super(BizmessageContent, datasource.createEntityManager());
  }

  async findOneByBizmessageId(
    bizmessageId: number,
  ): Promise<BizmessageContent> {
    return await this.findOne({ where: { bizmessageId } });
  }
}

@Injectable()
export class BizmessageAdReceiverListRepository extends Repository<BizmessageAdReceiverList> {
  constructor(private datasource: DataSource) {
    super(BizmessageAdReceiverList, datasource.createEntityManager());
  }

  async findAllByUserIdAndSentAt(userId: number, threeDaysAgoDate) {
    return await this.createQueryBuilder('allReceiver')
      .where('allReceiver.userId = :userId', { userId })
      .andWhere('allReceiver.sentAt > :threeDaysAgoDate', {
        threeDaysAgoDate,
      })
      .getMany();
  }
}

@Injectable()
export class BizmessageImageInfoRepository extends Repository<BizmessageImageInfo> {
  constructor(private datasource: DataSource) {
    super(BizmessageImageInfo, datasource.createEntityManager());
  }
}
