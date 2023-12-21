import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('MessageHistory')
export class MessageHistoryOrmEntity {
  @PrimaryGeneratedColumn()
  messageHistoryId: number;

  @Column()
  phoneNumber: string;

  @Column()
  content: string;

  @Column()
  deliveredAt: Date;
}
