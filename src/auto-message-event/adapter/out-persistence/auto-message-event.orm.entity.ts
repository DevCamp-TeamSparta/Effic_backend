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
  totalSentCount: number | null;

  @Column({ nullable: true })
  clickCount: number | null;

  @Column({ nullable: true })
  clickRate: number | null;

  @Column()
  scheduledEndDate: Date;

  @Column()
  createdDate: Date;

  @Column()
  isActive: boolean;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column({ name: 'userId' })
  userId: number;
}
