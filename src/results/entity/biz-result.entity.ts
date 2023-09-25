import {
  PrimaryGeneratedColumn,
  Column,
  Entity,
  BaseEntity,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Bizmessage } from 'src/bizmessage/bizmessage.entity';
import { User } from 'src/users/user.entity';

@Entity()
export class BizNcpResult extends BaseEntity {
  @PrimaryGeneratedColumn({ type: 'int' })
  BizNcpResultId: number;

  @Column({ type: 'int', nullable: false })
  bizmessageId: number;

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

  @ManyToOne(() => Bizmessage, (bizmessage) => bizmessage.bizncpResults, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'bizmessageId' })
  bizmessage: Bizmessage;

  @ManyToOne(() => User, (user) => user.bizncpResults, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user: User;
}

@Entity()
export class BizUrlResult extends BaseEntity {
  @PrimaryGeneratedColumn({ type: 'int' })
  BizUrlResultId: number;

  @Column({ type: 'int', nullable: false, default: 0 })
  humanclicks: number;

  @Column({ type: 'int', nullable: false, default: 0 })
  totalclicks: number;

  @Column({ type: 'varchar', nullable: true })
  idString: string;

  @Column({ type: 'int', nullable: true })
  BizNcpResultId: number;

  @Column({ type: 'int', nullable: false })
  bizmessageId: number;

  @Column({ type: 'int', nullable: false })
  userId: number;

  @ManyToOne(() => Bizmessage, (bizmessage) => bizmessage.bizurlResults, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'bizmessageId' })
  bizmessage: Bizmessage;

  @ManyToOne(() => User, (user) => user.bizurlResults, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user: User;
}
