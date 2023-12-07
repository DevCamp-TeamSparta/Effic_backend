import { Sms } from 'src/target/domain/sms';
import { SmsOrmEntity } from '../entity/sms.orm.entity';

export class SmsMapper {
  static mapToSms(sms: SmsOrmEntity): Sms {
    return new Sms(sms.smsContent, sms.senderNumber);
  }

  static mapToSmsOrmEntity(sms: Sms): SmsOrmEntity {
    const smsEntity = new SmsOrmEntity();
    smsEntity.smsContent = sms.smsContent;
    smsEntity.senderNumber = sms.senderNumber;

    return smsEntity;
  }
}
