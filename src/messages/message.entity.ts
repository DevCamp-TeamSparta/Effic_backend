import {
  BaseEntity,
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  OneToMany,
  CreateDateColumn,
  JoinColumn,
  OneToOne,
} from 'typeorm';
import { MessageType } from './message.enum';
import { User } from '../users/user.entity';
import { Result } from '../results/result.entity';

@Entity()
export class Message extends BaseEntity {
  @PrimaryGeneratedColumn({ type: 'int' })
  messageId: number;

  @Column()
  isSent: boolean;

  @Column()
  sentType: MessageType;

  @CreateDateColumn({ name: 'createdAt', type: 'timestamp' })
  createdAt: Date;

  @Column({ type: 'varchar', nullable: false })
  receiverList: string[];

  @Column({ array: true, nullable: true, type: 'text', default: [] })
  idString: Array<string>;

  @Column({ type: 'varchar', nullable: true })
  urlForResult: string;

  @Column({ type: 'varchar', nullable: true })
  requestId: string;

  @Column({ type: 'int', nullable: false })
  userId: number;

  @ManyToOne(() => User, (user) => user.messages)
  @JoinColumn({ name: 'userId' })
  user: User;

  @OneToMany(() => Result, (result) => result.message, { cascade: true })
  results: Result[];

  @Column({ type: 'int', nullable: true })
  messageGroupId: number;

  // @ManyToOne(() => MessageGroup, (group) => group.messages)
  // @JoinColumn({ name: 'messageGroupId' })
  // messageGroup: MessageGroup;
}

@Entity()
export class MessageGroup extends BaseEntity {
  @PrimaryGeneratedColumn({ type: 'int' })
  id: number;

  @OneToMany(() => Message, 'messageGroupId')
  messages: Message[];

  @Column({ type: 'int', nullable: false })
  userId: number;
}

@Entity()
export class MessageContent extends BaseEntity {
  @PrimaryGeneratedColumn({ type: 'int' })
  contentId: number;

  @Column({ type: 'int', nullable: false })
  messageId: number;

  @Column()
  sentType: MessageType;

  @Column()
  content: string;

  @Column({ array: true, nullable: false, type: 'text', default: [] })
  receiverList: Array<string>;

  @OneToOne(() => Message)
  @JoinColumn({ name: 'messageId' })
  message: Message;

  @Column({ type: 'int', nullable: true })
  messageGroupId: number;
}

@Entity()
export class UrlInfo extends BaseEntity {
  @PrimaryGeneratedColumn({ type: 'int' })
  urlInfoId: number;

  @Column({ type: 'varchar', nullable: false })
  originalUrl: string;

  @Column({ type: 'varchar', nullable: false })
  shortenUrl: string;

  @Column({ type: 'varchar', nullable: false })
  idString: string;
}
