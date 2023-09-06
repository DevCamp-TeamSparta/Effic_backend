import {
  BaseEntity,
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
  OneToOne,
} from 'typeorm';
import { MessageType } from './message.enum';
import { User } from '../users/user.entity';
import { NcpResult, UrlResult } from 'src/results/result.entity';

@Entity()
export class Message extends BaseEntity {
  @PrimaryGeneratedColumn({ type: 'int' })
  messageId: number;

  @Column({ type: 'boolean', nullable: false, default: false })
  isSent: boolean;

  @Column()
  sentType: MessageType;

  @Column({
    type: 'timestamptz',
    nullable: false,
    default: () => 'CURRENT_TIMESTAMP',
  })
  createdAt: Date;

  @Column({ array: true, nullable: true, type: 'text', default: [] })
  receiverList: string[];

  @Column({ array: true, nullable: true, type: 'text', default: [] })
  idString: Array<string>;

  @Column({ type: 'varchar', nullable: true })
  urlForResult: string;

  @Column({ type: 'varchar', nullable: true })
  requestId: string;

  @Column({ type: 'boolean', nullable: false, default: false })
  isMoneyCheck: boolean;

  @Column({ type: 'int', nullable: false })
  userId: number;

  @ManyToOne(() => User, (user) => user.messages)
  @JoinColumn({ name: 'userId' })
  user: User;

  @OneToMany(() => NcpResult, (ncpResult) => ncpResult.message, {
    cascade: true,
  })
  ncpResults: NcpResult[];

  @OneToMany(() => UrlResult, (urlResult) => urlResult.message, {
    cascade: true,
  })
  urlResults: UrlResult[];

  @Column({ type: 'int', nullable: true })
  messageGroupId: number;

  @ManyToOne(() => MessageGroup, (group) => group.messages)
  @JoinColumn({ name: 'messageGroupId' })
  messageGroup: Promise<MessageGroup>;
}

@Entity()
export class MessageGroup extends BaseEntity {
  @PrimaryGeneratedColumn({ type: 'int' })
  id: number;

  @OneToMany(() => Message, (message) => message.messageGroup)
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

  @Column({ type: 'json', nullable: false, default: '[]' })
  content: {
    type: string;
    title: string;
    content: string;
    advertiseInfo: boolean;
    urlList: string[];
    reserveTime?: Date;
  };

  @Column({ type: 'varchar', nullable: false })
  hostnumber: string;

  @Column('json', { default: [] })
  receiverList: Record<string, any>;

  @Column('json', { default: [] })
  remainReceiverList: Record<string, any>;

  @OneToOne(() => Message)
  @JoinColumn({ name: 'messageId' })
  message: Message;

  @Column({ type: 'int', nullable: true })
  messageGroupId: number;
  messageContent: any[];
}

@Entity()
export class TlyUrlInfo extends BaseEntity {
  @Column({ type: 'varchar', nullable: false })
  idString: string;

  @Column({ type: 'varchar', nullable: false })
  originalUrl: string;

  @Column({ type: 'varchar', nullable: false })
  shortenUrl: string;

  @Column({ type: 'varchar', nullable: false, primary: true })
  firstShortenId: string;
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

  @OneToOne(() => TlyUrlInfo)
  @JoinColumn({
    name: 'idString',
    referencedColumnName: 'firstShortenId',
  })
  tlyUrlInfo: TlyUrlInfo;
}
