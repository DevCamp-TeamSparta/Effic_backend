import { Entity, Column, PrimaryGeneratedColumn, OneToMany } from 'typeorm';
// import { Message } from '../messages/message.entity';

@Entity()
export class User {
  @PrimaryGeneratedColumn({ type: 'int' })
  user_id: number;

  @Column({ type: 'varchar', unique: true, length: 30 })
  email: string;

  // @OneToMany(() => Message, (message) => message.user, { cascade: true })
  // messages: Messages[];
}
