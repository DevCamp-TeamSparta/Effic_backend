import {
  BaseEntity,
  Entity,
  Column,
  PrimaryGeneratedColumn,
  OneToMany,
} from 'typeorm';
import { AdvertiseReceiverList, Message } from '../messages/message.entity';
import { Payment } from '../payments/payments.entity';
import { NcpResult, UrlResult } from '../results/entity/result.entity';
import { PhonebookList } from 'src/phonebook/phonebook.entity';
import {
  Bizmessage,
  BizmessageAdReceiverList,
} from 'src/bizmessage/bizmessage.entity';
import {
  BizNcpResult,
  BizUrlResult,
} from 'src/results/entity/biz-result.entity';

@Entity()
export class User extends BaseEntity {
  @PrimaryGeneratedColumn({ type: 'int' })
  userId: number;

  @Column({ type: 'varchar', nullable: false, unique: true })
  email: string;

  @Column({ type: 'varchar', nullable: false })
  name: string;

  @Column({ array: true, nullable: true, type: 'text', default: [] })
  hostnumber: Array<string>;

  @Column({ type: 'boolean', nullable: false, default: true })
  isNcp: boolean;

  @Column({ type: 'varchar', nullable: true })
  refreshToken: string;

  @Column({ type: 'boolean', nullable: false })
  advertisementOpt: boolean;

  @Column({ type: 'int', nullable: true })
  point: number;

  @Column({ type: 'int', nullable: false, default: 0 })
  money: number;

  @OneToMany(() => Message, (message) => message.user, { cascade: true })
  messages: Message[];

  @OneToMany(() => Payment, (payment) => payment.user, { cascade: true })
  payments: Payment[];

  @OneToMany(() => NcpResult, (ncpResult) => ncpResult.message, {
    cascade: true,
  })
  ncpResults: NcpResult[];

  @OneToMany(() => UrlResult, (urlResult) => urlResult.message, {
    cascade: true,
  })
  urlResults: UrlResult[];

  @OneToMany(() => PhonebookList, (phonebookList) => phonebookList.user, {
    cascade: true,
  })
  phonebookList: PhonebookList[];

  @OneToMany(
    () => AdvertiseReceiverList,
    (advertiseReceiverList) => advertiseReceiverList.user,
    {
      cascade: true,
    },
  )
  advertiseReceiverList: AdvertiseReceiverList[];

  @OneToMany(() => Bizmessage, (bizmessage) => bizmessage.user, {
    cascade: true,
  })
  bizmessages: Bizmessage[];

  @OneToMany(() => BizmessageAdReceiverList, (receiver) => receiver.user, {
    cascade: true,
  })
  bizmessageAdReceiverList: BizmessageAdReceiverList[];

  @OneToMany(() => BizNcpResult, (bizNcpResult) => bizNcpResult.user, {
    cascade: true,
  })
  bizncpResults: BizNcpResult[];

  @OneToMany(() => BizUrlResult, (bizUrlResult) => bizUrlResult.user, {
    cascade: true,
  })
  bizurlResults: BizUrlResult[];
}

@Entity()
export class UserNcpInfo extends BaseEntity {
  @PrimaryGeneratedColumn({ type: 'int' })
  userInfoNcpId: number;

  @Column({ type: 'varchar', nullable: false })
  accessKey: string;

  @Column({ type: 'varchar', nullable: false })
  serviceId: string;

  @Column({ type: 'varchar', nullable: false, default: '' })
  bizServiceId: string;

  @Column({ type: 'varchar', nullable: false })
  secretKey: string;

  @Column({ array: true, nullable: true, type: 'text', default: [] })
  advertiseNumber: Array<string>;

  @Column({ array: true, nullable: true, type: 'text', default: [] })
  hostnumber: Array<string>;

  @Column({ type: 'int', nullable: false })
  userId: number;
}

@Entity()
export class HostnumberDetail extends BaseEntity {
  @PrimaryGeneratedColumn({ type: 'int' })
  hostnumberDetailId: number;

  @Column({ type: 'varchar', nullable: false })
  hostnumber: string;

  @Column({ type: 'varchar', nullable: false })
  memo: string;

  @Column({ type: 'int', nullable: false })
  userId: number;
}
