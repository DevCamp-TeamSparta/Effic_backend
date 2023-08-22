import {
  BaseEntity,
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  OneToMany,
  CreateDateColumn,
  JoinColumn,
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
  shortUrl: Array<string>;

  @Column({ type: 'varchar', nullable: true })
  requestId: string;

  @Column({ type: 'int', nullable: false })
  userId: number;

  @ManyToOne(() => User, (user) => user.messages)
  @JoinColumn({ name: 'userId' })
  user: User;

  @OneToMany(() => Result, (result) => result.message, { cascade: true })
  results: Result[];
}
