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
  user_id: number;

  @Column({ type: 'varchar', nullable: false, unique: true })
  email: string;

  @Column({ type: 'varchar', nullable: true })
  name: string;

  @Column({ type: 'varchar', nullable: true })
  number: string[];

  @Column({ type: 'varchar', nullable: true })
  access_key: string;

  @Column({ type: 'varchar', nullable: true })
  service_id: string;

  // @OneToMany(() => Message,, (message) => message.user, { cascade: true })
  // messages: Messages[];
}
