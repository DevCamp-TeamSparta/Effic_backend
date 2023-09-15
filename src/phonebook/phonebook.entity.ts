import {
  BaseEntity,
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { User } from '../users/user.entity';

@Entity()
export class PhonebookList extends BaseEntity {
  @PrimaryGeneratedColumn({ type: 'int' })
  phonebookId: number;

  @Column({ type: 'varchar', nullable: false })
  title: string;

  @Column({ array: true, nullable: true, type: 'int', default: [] })
  members: Array<number>;

  @Column({
    type: 'timestamptz',
    nullable: false,
    default: () => 'CURRENT_TIMESTAMP',
  })
  createdAt: Date;

  @Column({
    type: 'timestamptz',
    nullable: false,
    default: () => 'CURRENT_TIMESTAMP',
  })
  updatedAt: Date;

  @Column({ type: 'int', nullable: false })
  userId: number;

  @ManyToOne(() => User, (user) => user.phonebookList)
  @JoinColumn({ name: 'userId' })
  user: User;
}

@Entity()
export class AllContacts extends BaseEntity {
  @PrimaryGeneratedColumn({ type: 'int' })
  contactId: number;

  @Column({ type: 'varchar', nullable: true })
  name: string;

  @Column({ type: 'varchar', nullable: false })
  number: string;

  @Column({ type: 'int', nullable: false })
  userId: number;
}
