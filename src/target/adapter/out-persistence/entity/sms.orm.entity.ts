import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('Sms')
export class SmsOrmEntity {
  @PrimaryGeneratedColumn()
  smsId: number;

  @Column()
  smsContent: string;

  @Column()
  senderNumber: string;
}
