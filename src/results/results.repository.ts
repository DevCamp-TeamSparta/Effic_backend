import { Injectable } from '@nestjs/common';
import { Result } from './result.entity';
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
