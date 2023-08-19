import { Injectable } from '@nestjs/common';
import { Result } from './result.entity';
import { Repository, DataSource } from 'typeorm';

@Injectable()
export class ResultsRepository extends Repository<Result> {
  constructor(private datasource: DataSource) {
    super(Result, datasource.createEntityManager());
  }

  async findOlderThanTwentyFourHours(): Promise<Result[]> {
    const twentyFourHoursAgo = new Date();
    twentyFourHoursAgo.setDate(twentyFourHoursAgo.getDate() - 1);

    return this.createQueryBuilder('message')
      .where('message.createdAt < :twentyFourHoursAgo', { twentyFourHoursAgo })
      .getMany();
  }

  async findOlderThanThreeDays(): Promise<Result[]> {
    const threeDaysAgo = new Date();
    threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);

    return this.createQueryBuilder('message')
      .where('message.createdAt < :threeDaysAgo', { threeDaysAgo })
      .getMany();
  }
}
