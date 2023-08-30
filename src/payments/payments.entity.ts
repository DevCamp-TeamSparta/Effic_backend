import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  BaseEntity,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { User } from '../users/user.entity';

@Entity()
export class Payment extends BaseEntity {
  @PrimaryGeneratedColumn({ type: 'int' })
  paymentId: number;

  @Column({ type: 'varchar', nullable: false })
  createdAt: Date;

  @Column({ type: 'varchar', nullable: false })
  name: string;

  @Column({ type: 'int', nullable: false })
  chargemoney: number;

  @Column({ type: 'varchar', nullable: false })
  merchant_uid: string;

  @Column({ type: 'int', nullable: true })
  userId: number;

  @ManyToOne(() => User, (user) => user.payments)
  @JoinColumn({ name: 'userId' })
  user: User;
}

@Entity()
export class Refund extends BaseEntity {
  @PrimaryGeneratedColumn({ type: 'int' })
  refundId: number;

  @Column({ type: 'varchar', nullable: false })
  createdAt: Date;

  @Column({ type: 'int', nullable: false })
  refundmoney: number;

  @Column({ type: 'varchar', nullable: false })
  accountHolder: string;

  @Column({ type: 'varchar', nullable: false })
  accountNumber: string;

  @Column({ type: 'varchar', nullable: false })
  bankName: string;

  @Column({ type: 'varchar', nullable: false })
  contactNumber: string;

  @Column({ type: 'int', nullable: true })
  userId: number;

  @ManyToOne(() => User, (user) => user.payments)
  @JoinColumn({ name: 'userId' })
  user: User;
}
