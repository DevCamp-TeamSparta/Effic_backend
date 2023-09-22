import {
  BaseEntity,
  Column,
  Entity,
  PrimaryGeneratedColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
} from 'typeorm';
import { bizmessageType } from './bizmessage.enum';
import { User } from 'src/users/user.entity';

@Entity()
export class Bizmessage extends BaseEntity {
  @PrimaryGeneratedColumn({ type: 'int' })
  bizmessageId: number;

  @Column({ type: 'boolean', nullable: false, default: false })
  isSent: boolean;

  @Column()
  sentTpye: bizmessageType;

  @Column({ array: true, nullable: true, type: 'text', default: [] })
  idStringList: Array<string>;

  @Column({ type: 'varchar', nullable: true })
  urlForResult: string;

  @Column({ array: true, nullable: true, type: 'text', default: [] })
  ncpRequestIdList: string[];

  @Column({ array: true, nullable: true, type: 'text', default: [] })
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
}
