import {
  BaseEntity,
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Message } from '../messages/message.entity';
import { User } from '../users/user.entity';

@Entity()
export class Result extends BaseEntity {
  @PrimaryGeneratedColumn({ type: 'int' })
  id: number;

  @Column()
  totalClicks: number;

  @Column()
  humanClicks: number;

  @Column()
  success: number;

  @Column()
  reserved: number;

  @Column()
  fail: number;

  @ManyToOne(() => Message, (message) => message.results)
  @JoinColumn({ name: 'messageId' })
  message: Message;

  @ManyToOne(() => User, (user) => user.results)
  @JoinColumn({ name: 'userId' })
  user: User;
}
