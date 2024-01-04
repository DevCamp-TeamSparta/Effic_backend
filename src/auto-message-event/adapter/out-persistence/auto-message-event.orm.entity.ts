// import { SegmentOrmEntity } from 'src/segment/adapter/out-persistence/segment.orm.entity';
import { User } from 'src/users/user.entity';
import {
  Column,
  Entity,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';

@Entity('AutoMessageEvent')
export class AutoMessageEventOrmEntity {
  @PrimaryGeneratedColumn()
  autoMessageEventId: number;

  @Column()
  autoMessageEventName: string;

  @Column({ nullable: true })
  isReserved: boolean;

  @Column({ nullable: true })
  updatedAtColumnName: string;

  @Column({ nullable: true })
  autoMessageEventLastRunTime: Date;

  @Column()
  scheduledEndDate: Date;

  @Column()
  createdDate: Date;

  @Column()
  isActive: boolean;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column()
  userId: number;

  // @ManyToOne(() => SegmentOrmEntity)
  // @JoinColumn({ name: 'segmentId' })
  // segment: SegmentOrmEntity;

  @Column({ nullable: true })
  segmentId: number;

  /**cronTargetReservationTime에 필요한 정보 */
  @Column({ nullable: true })
  reservationTime: Date;

  @Column('int', { array: true, nullable: true })
  targetIds: number[];

  @Column({ nullable: true })
  isRecurring: boolean;

  @Column({ nullable: true })
  receiverNumberColumnName: string;

  @Column('text', { array: true, nullable: true })
  weekDays: string[];

  @Column({ nullable: true })
  endDate: Date;

  @Column({ nullable: true })
  timeColumnName: string;

  @Column({ nullable: true })
  delayDays: number;

  /**즉시 발송에 필요한 정보 */
  @Column({ nullable: true })
  email: string;

  @Column({ nullable: true })
  hostnumber: string;

  @Column({ nullable: true })
  messageTitle: string;

  @Column({ nullable: true })
  messageContentTemplate: string;

  @Column({ nullable: true })
  advertiseInfo: boolean;

  /**통계에 필요한 정보 */
  @Column({ nullable: true })
  totalSentCount: number | null;

  @Column({ nullable: true })
  clickCount: number | null;

  @Column({ nullable: true })
  clickRate: number | null;
}
