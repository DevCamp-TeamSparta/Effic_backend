import {
  BaseEntity,
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
  CreateDateColumn,
} from 'typeorm';
import { Message } from '../messages/message.entity';
import { User } from '../users/user.entity';

@Entity()
export class Result extends BaseEntity {
  @PrimaryGeneratedColumn({ type: 'int' })
  ResultId: number;

  @Column({ array: true, nullable: true, type: 'text', default: [] })
  urls: Array<string>;

  @Column({ type: 'int', nullable: true })
  success: number;

  @Column({ type: 'int', nullable: true })
  reserved: number;

  @Column({ type: 'int', nullable: true })
  fail: number;

  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date;

  @Column({ type: 'int', nullable: true })
  messageId: number;

  @Column({ type: 'varchar', nullable: true })
  shortUrl: string;

  @Column({ type: 'int', nullable: true })
  userId: number;

  @ManyToOne(() => Message, (message) => message.results)
  @JoinColumn({ name: 'messageId' })
  message: Message;

  @ManyToOne(() => User, (user) => user.results)
  @JoinColumn({ name: 'userId' })
  user: User;
}

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

  @ManyToOne(() => Message, (message) => message.results)
  @JoinColumn({ name: 'messageId' })
  message: Message;

  @ManyToOne(() => User, (user) => user.results)
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

  @ManyToOne(() => Message, (message) => message.results)
  @JoinColumn({ name: 'messageId' })
  message: Message;

  @ManyToOne(() => User, (user) => user.results)
  @JoinColumn({ name: 'userId' })
  user: User;
}
