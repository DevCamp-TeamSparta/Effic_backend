import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('Target')
export class TargetOrmEntity {
  @PrimaryGeneratedColumn()
  targetId: number;

  @Column({ nullable: true })
  messageTitle: string;

  @Column()
  messageContent: string;

  @Column()
  receiverNumber: string;

  @Column({ nullable: true })
  reservedAt: Date | null;

  @Column()
  sentStatus: boolean;

  @Column()
  hostnumber: string;

  @Column()
  advertiseInfo: boolean;

  @Column()
  email: string;
}
