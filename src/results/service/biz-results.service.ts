import { Injectable, Logger } from '@nestjs/common';
import { InjectEntityManager } from '@nestjs/typeorm';
import { EntityManager } from 'typeorm';
import { BizmessageNcpResultsRepository } from '../repository/biz-result.repository';

@Injectable()
export class BizmessageResultsService {
  private logger = new Logger('BizmessageResultsService');
  constructor(
    private readonly bizmessageNcpResultsRepository: BizmessageNcpResultsRepository,
    @InjectEntityManager() private readonly entityManager: EntityManager,
  ) {}

  // ncp 결과
  async ncpResult(bizmessageId: number): Promise<any> {}

  //
}
