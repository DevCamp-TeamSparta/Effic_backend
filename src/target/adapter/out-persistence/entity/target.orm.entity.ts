import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('Target')
export class TargetOrmEntity {
  @PrimaryGeneratedColumn()
  targetId: number;

  @Column()
  targetName: string;

  @Column()
  targetPhoneNumber: string;

  @Column()
  sendDateTime: Date;

  @Column()
  sentStatus: boolean;

  @Column()
  isRecurringTarget: boolean;

  @Column()
  smsId: number;
}
