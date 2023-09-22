import { BaseEntity, Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { bizmessageType } from './bizmessage.enum';

@Entity()
export class Bizmessage extends BaseEntity {
  @PrimaryGeneratedColumn({ type: 'int' })
  bizmessageId: number;

  @Column({ type: 'boolean', nullable: false, default: false })
  isSent: boolean;

  @Column()
  sentTpye: bizmessageType;

  @Column({ array: true, nullable: true, type: 'text', default: [] })
  idString: Array<string>;

  @Column({ array: true, nullable: true, type: 'text', default: [] })
  receiverList: string[];

  @Column({
    type: 'timestamp',
    nullable: false,
    default: () => 'CURRENT_TIMESTAMP',
  })
  createdAt: Date;
}
