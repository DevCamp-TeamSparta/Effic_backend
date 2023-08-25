import {
  BaseEntity,
  Entity,
  Column,
  PrimaryGeneratedColumn,
  OneToMany,
} from 'typeorm';
import { Message } from '../messages/message.entity';
import { Payment } from '../payments/payments.entity';
import { NcpResult, UrlResult } from '../results/result.entity';

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

  @Column({ type: 'varchar', nullable: false })
  accessKey: string;

  @Column({ type: 'varchar', nullable: false })
  serviceId: string;

  @Column({ type: 'varchar', nullable: false })
  secretKey: string;

  @Column({ type: 'varchar', nullable: true })
  refreshToken: string;

  @Column({ type: 'varchar', nullable: false })
  advertisementOpt: boolean;

  @Column({ type: 'int', nullable: true })
  point: number;

  @Column({ type: 'int', nullable: true })
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
}
