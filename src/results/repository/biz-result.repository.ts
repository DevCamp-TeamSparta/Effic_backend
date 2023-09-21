import { Injectable } from '@nestjs/common';
import { Repository, DataSource } from 'typeorm';
import { BizNcpResult } from '../entity/biz-result.entity';

@Injectable()
export class BizmessageNcpResultsRepository extends Repository<BizNcpResult> {
  constructor(private datasource: DataSource) {
    super(BizNcpResult, datasource.createEntityManager());
  }
}
