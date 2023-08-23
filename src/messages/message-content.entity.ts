import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  OneToOne,
  JoinColumn,
} from 'typeorm';
import { Message } from './message.entity';

@Entity()
export class MessageContent {
  @PrimaryGeneratedColumn({ type: 'int' })
  contentId: number;

  @Column()
  messageId: number;

  @Column()
  content: string;

  @Column({ array: true, nullable: true, type: 'text', default: [] })
  receiverList: Array<string>;

  @OneToOne(() => Message)
  @JoinColumn({ name: 'messageId' })
  message: Message;
}
