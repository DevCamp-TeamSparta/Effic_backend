import {
  BaseEntity,
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  CreateDateColumn,
} from 'typeorm';
import { MessageType } from './message.enum';

@Entity()
export class Message extends BaseEntity {
  @PrimaryGeneratedColumn({ type: 'int' })
  message_id: number;

  @Column()
  is_sent: boolean;

  @Column()
  sent_type: MessageType;

  @Column({ type: 'varchar', nullable: true })
  title: string;

  @CreateDateColumn()
  createdAt: Date;
}
