import {
  BaseEntity,
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Message } from '../messages/message.entity';

@Entity()
export class Result extends BaseEntity {
  @PrimaryGeneratedColumn({ type: 'int' })
  id: number;

  @Column()
  totalClicks: number;

  @Column()
  humanClicks: number;

  @ManyToOne(() => Message, (message) => message.user)
  @JoinColumn({ name: 'messageId' })
  message: Message;
}
