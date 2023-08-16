import {
  BaseEntity,
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  CreateDateColumn,
  JoinColumn,
} from 'typeorm';
import { MessageType } from './message.enum';
import { User } from '../users/user.entity';

@Entity()
export class Message extends BaseEntity {
  @PrimaryGeneratedColumn({ type: 'int' })
  messageId: number;

  @Column()
  isSent: boolean;

  @Column()
  sentType: MessageType;

  @CreateDateColumn()
  createdAt: Date;

  @Column({ type: 'varchar', nullable: false })
  receiver: string[];

  @Column({ type: 'varchar', nullable: true })
  shortUrl: string[];

  @Column({ type: 'varchar', nullable: false })
  requestId: string;

  @ManyToOne(() => User, (user) => user.messages)
  @JoinColumn({ name: 'userId' })
  user: User;
}
