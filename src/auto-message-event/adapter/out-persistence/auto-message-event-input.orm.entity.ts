import { User } from 'src/users/user.entity';
import {
  Column,
  Entity,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { AutoMessageEventOrmEntity } from './auto-message-event.orm.entity';

@Entity('AutoMessageEvent')
export class AutoMessageEventInputOrmEntity {
  @PrimaryGeneratedColumn()
  autoMessageEventInputId: number;

  // @ManyToOne(() => AutoMessageEventOrmEntity)
  // @JoinColumn({ name: 'autoMessageEventId' })
  // autoMessageEvent: AutoMessageEventOrmEntity;

  @Column()
  autoMessageEventId: number;

  @Column({ nullable: true })
  autoMessageEventName: string;

  /**step 1: 발송 대상 설정 */
  @Column({ nullable: true })
  selectedSegmentId: number;

  @Column({ nullable: true })
  selectedValue: string;

  /**step 2: 필터링 설정 */
  @Column({ nullable: true })
  selectedFilter: string;

  @Column({ type: 'jsonb', nullable: true })
  userInputs: any;

  @Column({ type: 'jsonb', nullable: true })
  excludeValues: any;

  @Column({ nullable: true })
  localButtonText: string;

  @Column({ nullable: true })
  FilteredTableNum: number;

  @Column({ nullable: true })
  fatigueLevelDay: number;

  @Column({ nullable: true })
  timeColumnName: string;

  /**step 3: 문자 내용 입력 */
  @Column({ nullable: true })
  textAreaValue: string;

  @Column({ nullable: true })
  inputValue: string;

  @Column({ nullable: true })
  phoneReceiveNumValue: string;

  @Column({ nullable: true })
  selectedReceiverNumberName: string;

  @Column({ nullable: true })
  phoneSendNumValue: string;

  @Column({ nullable: true })
  isTextAreaClicked: boolean;

  @Column({ nullable: true })
  advertisingConsent: boolean;

  @Column({ nullable: true })
  guidanceConsent: boolean;

  /**step 4: 발송 시간 설정 */
  @Column({ nullable: true })
  selectedTrigger: string;

  @Column({ nullable: true })
  selectedColumnName: string;

  @Column({ nullable: true })
  inputValueColumnName: string;

  @Column({ type: 'jsonb', nullable: true })
  columnData: any;

  @Column({ nullable: true })
  selectedPeriod: string;

  @Column({ type: 'jsonb', nullable: true })
  selectedDaysOfWeek: any;

  @Column({ nullable: true })
  hour: number;

  @Column({ nullable: true })
  minute: number;

  @Column({ nullable: true })
  date: string;
}
