import {
  BaseEntity,
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Message } from '../../messages/message.entity';
import { User } from '../../users/user.entity';

@Entity()
export class NcpResult extends BaseEntity {
  @PrimaryGeneratedColumn({ type: 'int' })
  ncpResultId: number;

  @Column({ type: 'int', nullable: false })
  messageId: number;

  @Column({ type: 'int', nullable: false })
  userId: number;

  @Column({ type: 'int', nullable: false, default: 0 })
  success: number;

  @Column({ type: 'int', nullable: false, default: 0 })
  reserved: number;

  @Column({ type: 'int', nullable: false, default: 0 })
  fail: number;

  @Column({
    type: 'timestamptz',
    nullable: false,
    default: () => 'CURRENT_TIMESTAMP',
  })
  createdAt: Date;

  @ManyToOne(() => Message, (message) => message.ncpResults, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'messageId' })
  message: Message;

  @ManyToOne(() => User, (user) => user.ncpResults, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user: User;
}

@Entity()
export class UrlResult extends BaseEntity {
  @PrimaryGeneratedColumn({ type: 'int' })
  urlResultId: number;

  @Column({ type: 'int', nullable: false, default: 0 })
  humanclicks: number;

  @Column({ type: 'int', nullable: false, default: 0 })
  totalclicks: number;

  @Column({ type: 'varchar', nullable: true })
  idString: string;

  @Column({ type: 'int', nullable: true })
  ncpResultId: number;

  @Column({ type: 'int', nullable: false })
  messageId: number;

  @Column({ type: 'int', nullable: false })
  userId: number;

  @ManyToOne(() => Message, (message) => message.urlResults, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'messageId' })
  message: Message;

  @ManyToOne(() => User, (user) => user.urlResults, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user: User;
}

@Entity()
export class UsedPayments extends BaseEntity {
  @PrimaryGeneratedColumn({ type: 'int' })
  usedPaymentId: number;

  @Column({ type: 'int', nullable: false, default: 0 })
  usedPoint: number;

  @Column({ type: 'int', nullable: false, default: 0 })
  usedMoney: number;

  @Column({ type: 'int', nullable: false, default: 0 })
  refundPayment: number;

  @Column({ type: 'int', nullable: false, default: 0 })
  remainPoint: number;

  @Column({ type: 'int', nullable: false, default: 0 })
  remainMoney: number;

  @Column({
    type: 'timestamptz',
    nullable: false,
    default: () => 'CURRENT_TIMESTAMP',
  })
  createdAt: Date;

  @Column({ type: 'int', nullable: false })
  userId: number;

  @Column({ type: 'int', nullable: false, default: 0 })
  messageGroupId: number;

  @Column({ type: 'int', nullable: false, default: 0 })
  bizmessageGroupId: number;

  @ManyToOne(() => User, (user) => user.urlResults, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user: User;
}
