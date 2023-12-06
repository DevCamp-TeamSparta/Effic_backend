import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ISmsPort } from 'src/target/application/port/out/sms.port';
import { SmsOrmEntity } from '../entity/sms.orm.entity';
import { Sms } from 'src/target/domain/sms';
import { SmsMapper } from '../mapper/sms.mapper';

@Injectable()
export class SmsRepository implements ISmsPort {
  constructor(
    @InjectRepository(SmsOrmEntity)
    private readonly smsRepository: Repository<SmsOrmEntity>,
  ) {}

  async saveSms(smsContent: string, senderNumber: string): Promise<void> {
    const domainSms = new Sms(smsContent, senderNumber);

    const smsOrmEntity = SmsMapper.mapToSmsOrmEntity(domainSms);

    await this.smsRepository.save(smsOrmEntity);
  }
}
