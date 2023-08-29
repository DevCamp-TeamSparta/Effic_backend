import {
  BaseEntity,
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Message } from '../messages/message.entity';
import { User } from '../users/user.entity';

@Entity()
export class NcpResult extends BaseEntity {
  @PrimaryGeneratedColumn({ type: 'int' })
  ncpResultId: number;

  @Column({ type: 'int', nullable: true })
  messageId: number;

  @Column({ type: 'int', nullable: true })
  userId: number;

  @Column({ type: 'int', nullable: true })
  success: number;

  @Column({ type: 'int', nullable: true })
  reserved: number;

  @Column({ type: 'int', nullable: true })
  fail: number;

  @Column({
    type: 'timestamp',
    nullable: false,
    default: () => 'CURRENT_TIMESTAMP',
  })
  createdAt: Date;

  @ManyToOne(() => Message, (message) => message.ncpResults)
  @JoinColumn({ name: 'messageId' })
  message: Message;

  @ManyToOne(() => User, (user) => user.ncpResults)
  @JoinColumn({ name: 'userId' })
  user: User;
}

@Entity()
export class UrlResult extends BaseEntity {
  @PrimaryGeneratedColumn({ type: 'int' })
  urlResultId: number;

  @Column({ type: 'int', nullable: true })
  humanclicks: number;

  @Column({ type: 'int', nullable: true })
  totalclicks: number;

  @Column({ type: 'varchar', nullable: true })
  idString: string;

  @Column({ type: 'int', nullable: true })
  ncpResultId: number;

  @Column({ type: 'int', nullable: true })
  messageId: number;

  @Column({ type: 'int', nullable: true })
  userId: number;

  @ManyToOne(() => Message, (message) => message.urlResults)
  @JoinColumn({ name: 'messageId' })
  message: Message;

  @ManyToOne(() => User, (user) => user.urlResults)
  @JoinColumn({ name: 'userId' })
  user: User;
}

@Entity()
export class UsedPayments extends BaseEntity {
  @PrimaryGeneratedColumn({ type: 'int' })
  usedPaymentId: number;

  @Column({ type: 'int', nullable: true })
  usedPayment: number;

  @Column({ type: 'int', nullable: true })
  alreadyUsed: number;

  @Column({
    type: 'timestamp',
    nullable: false,
    default: () => 'CURRENT_TIMESTAMP',
  })
  createdAt: Date;

  @Column({ type: 'int', nullable: true })
  userId: number;

  @Column({ type: 'int', nullable: true })
  messageId: number;

  @ManyToOne(() => Message, (message) => message.urlResults)
  @JoinColumn({ name: 'messageId' })
  message: Message;

  @ManyToOne(() => User, (user) => user.urlResults)
  @JoinColumn({ name: 'userId' })
  user: User;
}
