import {
  BaseEntity,
  Column,
  Entity,
  PrimaryGeneratedColumn,
  ManyToOne,
  OneToMany,
  OneToOne,
  JoinColumn,
} from 'typeorm';
import { bizmessageType } from './bizmessage.enum';
import { User } from 'src/users/user.entity';
import {
  BizNcpResult,
  BizUrlResult,
} from 'src/results/entity/biz-result.entity';

@Entity()
export class Bizmessage extends BaseEntity {
  @PrimaryGeneratedColumn({ type: 'int' })
  bizmessageId: number;

  @Column({ type: 'boolean', nullable: false, default: false })
  isSent: boolean;

  @Column()
  sentType: bizmessageType;

  @Column({ nullable: true, type: 'jsonb', default: '[]' })
  buttonIdStringList: Record<string, any>[];

  @Column({ array: true, nullable: true, type: 'text', default: [] })
  imageIdString: Array<string>;

  @Column({ array: true, nullable: true, type: 'text', default: [] })
  contentIdStringList: Array<string>;

  @Column({ array: true, nullable: true, type: 'text', default: [] })
  ncpRequestIdList: string[];

  @Column({ array: true, nullable: false, type: 'text', default: [] })
  receiverList: string[];

  @Column({
    type: 'timestamp',
    nullable: false,
    default: () => 'CURRENT_TIMESTAMP',
  })
  createdAt: Date;

  @Column({ type: 'boolean', nullable: false, default: false })
  isMoneyCheck: boolean;

  @Column({ type: 'int', nullable: false })
  userId: number;

  @ManyToOne(() => User, (user) => user.bizmessages, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column({ type: 'int', nullable: false, default: 0 })
  bizmessageGroupId: number;

  @ManyToOne(
    () => BizmessageGroup,
    (bizmessageGroup) => bizmessageGroup.bizmessages,
    { onDelete: 'CASCADE' },
  )
  @JoinColumn({ name: 'bizmessageGroupId' })
  bizmessageGroup: Promise<BizmessageGroup>;

  @OneToMany(() => BizNcpResult, (bizNcpResult) => bizNcpResult.bizmessage, {
    cascade: true,
  })
  bizncpResults: BizNcpResult[];

  @OneToMany(() => BizUrlResult, (bizUrlResult) => bizUrlResult.bizmessage, {
    cascade: true,
  })
  bizurlResults: BizUrlResult[];
}

@Entity()
export class BizmessageGroup extends BaseEntity {
  @PrimaryGeneratedColumn({ type: 'int' })
  bizmessageGroupId: number;

  @OneToMany(() => Bizmessage, (bizmessage) => bizmessage.bizmessageGroup, {
    cascade: true,
  })
  bizmessages: Bizmessage[];

  @Column({ type: 'int', nullable: false })
  userId: number;

  @OneToMany(
    () => BizmessageAdReceiverList,
    (bizmessageAdReceiverList) => bizmessageAdReceiverList.bizmessageGroup,
    { cascade: true },
  )
  bizmessageAdReceiverList: BizmessageAdReceiverList[];
}

@Entity()
export class BizmessageContent extends BaseEntity {
  @PrimaryGeneratedColumn({ type: 'int' })
  bizmessageContentId: number;

  @Column({ type: 'int', nullable: false })
  bizmessageId: number;

  @OneToOne(() => Bizmessage)
  @JoinColumn({ name: 'bizmessageId' })
  bizmessage: Bizmessage;

  @Column()
  sentType: bizmessageType;

  @Column({ type: 'varchar', nullable: false, default: '' })
  title: string;

  @Column({ type: 'jsonb', nullable: false, default: '[]' })
  content: {
    type: string;
    content: string;
    advertiseInfo: boolean;
    contentUrlList?: string[];
    buttonUrl?: string;
    imageUrl?: string;
    reserveTime?: Date;
  };

  @Column({ type: 'varchar', nullable: false })
  plusFriendId: string;

  @Column('jsonb', { default: [] })
  receiverList: Record<string, any>;

  @Column('jsonb', { default: [] })
  remainReceiverList: Record<string, any>;

  @Column({ type: 'int', nullable: true })
  bizmessageGroupId: number;
}

@Entity()
export class BizmessageAdReceiverList extends BaseEntity {
  @PrimaryGeneratedColumn({ type: 'int' })
  bizmessageAdReceiverId: number;

  @Column({ type: 'varchar', nullable: false })
  phone: string;

  @Column({ type: 'timestamptz', nullable: false })
  sentAt: Date;

  @Column({ type: 'int', nullable: false })
  userId: number;

  @ManyToOne(() => User, (user) => user.bizmessageAdReceiverList, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column({ type: 'int', nullable: true })
  bizmessageGroupId: number;

  @ManyToOne(
    () => BizmessageGroup,
    (bizmessageGroup) => bizmessageGroup.bizmessageAdReceiverList,
    { onDelete: 'CASCADE' },
  )
  @JoinColumn({ name: 'bizmessageGroupId' })
  bizmessageGroup: BizmessageGroup;
}
