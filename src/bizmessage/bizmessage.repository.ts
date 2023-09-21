import { Injectable } from '@nestjs/common';
import { Repository, DataSource } from 'typeorm';
import { Bizmessage } from './bizmessage.entity';

@Injectable()
export class BizmessageRepository extends Repository<Bizmessage> {
  constructor(private datasource: DataSource) {
    super(Bizmessage, datasource.createEntityManager());
  }
}
