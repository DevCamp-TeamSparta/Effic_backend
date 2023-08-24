import { Injectable } from '@nestjs/common';
import { Result, UrlResult, NcpResult } from './result.entity';
import { Repository, DataSource } from 'typeorm';

@Injectable()
export class ResultsRepository extends Repository<Result> {
  constructor(private datasource: DataSource) {
    super(Result, datasource.createEntityManager());
  }

  async findAllByMessageId(messageId: number): Promise<Result[]> {
    return await this.find({ where: { messageId } });
  }
}

@Injectable()
export class UrlResultsRepository extends Repository<UrlResult> {
  constructor(private datasource: DataSource) {
    super(UrlResult, datasource.createEntityManager());
  }

  async findAllByMessageId(messageId: number): Promise<UrlResult[]> {
    return await this.find({ where: { messageId } });
  }

  async findAllByResultId(ncpResultId: number): Promise<UrlResult[]> {
    return await this.find({ where: { ncpResultId } });
  }
}

@Injectable()
export class NcpResultsRepository extends Repository<NcpResult> {
  constructor(private datasource: DataSource) {
    super(NcpResult, datasource.createEntityManager());
  }

  async findAllByMessageId(messageId: number): Promise<NcpResult[]> {
    return await this.find({ where: { messageId } });
  }
}
