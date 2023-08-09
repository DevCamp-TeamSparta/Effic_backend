import {
  BaseEntity,
  Entity,
  Column,
  PrimaryGeneratedColumn,
  OneToMany,
} from 'typeorm';
// import { Message } from '../messages/message.entity';

@Entity()
export class User extends BaseEntity {
  @PrimaryGeneratedColumn({ type: 'int' })
  userId: number;

  @Column({ type: 'varchar', nullable: false, unique: true })
  email: string;

  @Column({ type: 'varchar', nullable: true })
  name: string;

  @Column({ type: 'varchar', nullable: true })
  number: string[];

  @Column({ type: 'varchar', nullable: true })
  accessKey: string;

  @Column({ type: 'varchar', nullable: true })
  serviceId: string;

  @Column({ type: 'varchar', nullable: true })
  refreshToken: string;

  // @OneToMany(() => Message,, (message) => message.user, { cascade: true })
  // messages: Messages[];
}
