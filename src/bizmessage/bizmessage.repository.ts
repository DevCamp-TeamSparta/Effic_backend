import { Injectable } from '@nestjs/common';
import { Repository, DataSource } from 'typeorm';
import { Bizmessage, BizmessageGroup } from './bizmessage.entity';

@Injectable()
export class BizmessageRepository extends Repository<Bizmessage> {
  constructor(private datasource: DataSource) {
    super(Bizmessage, datasource.createEntityManager());
  }

  async findOneByBizmessageId(bizmessageId: number): Promise<Bizmessage> {
    return await this.findOne({ where: { bizmessageId } });
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
}
