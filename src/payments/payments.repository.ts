import { Injectable } from '@nestjs/common';
import { Repository, DataSource } from 'typeorm';
import { Payment } from './payments.entity';

@Injectable()
export class PaymentsRepository extends Repository<Payment> {
  constructor(private datasource: DataSource) {
    super(Payment, datasource.createEntityManager());
  }

  async findOneByPaymentId(merchant_uid: string): Promise<Payment> {
    return await this.findOne({ where: { merchant_uid } });
  }
}
