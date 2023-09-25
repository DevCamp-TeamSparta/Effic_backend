import { Injectable } from '@nestjs/common';
import { Repository, DataSource } from 'typeorm';
import { BizNcpResult, BizUrlResult } from '../entity/biz-result.entity';

@Injectable()
export class BizmessageNcpResultsRepository extends Repository<BizNcpResult> {
  constructor(private datasource: DataSource) {
    super(BizNcpResult, datasource.createEntityManager());
  }

  async findAllByBizmessageId(bizmessageId: number): Promise<BizNcpResult[]> {
    return await this.find({ where: { bizmessageId } });
  }

  async findLastOneByBizmessageId(bizmessageId: number): Promise<BizNcpResult> {
    return await this.findOne({
      where: { bizmessageId },
      order: { bizNcpResultId: 'DESC' },
    });
  }
}

@Injectable()
export class BizmessageUrlResultRepository extends Repository<BizUrlResult> {
  constructor(private datasource: DataSource) {
    super(BizUrlResult, datasource.createEntityManager());
  }

  async findAllByBizmessageId(bizmessageId: number): Promise<BizUrlResult[]> {
    return await this.find({ where: { bizmessageId } });
  }

  async findAllByResultId(bizNcpResultId: number): Promise<BizUrlResult[]> {
    return await this.find({ where: { bizNcpResultId } });
  }
}
