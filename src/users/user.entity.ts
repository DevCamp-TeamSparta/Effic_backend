import { BaseEntity, Entity, Column, PrimaryGeneratedColumn } from 'typeorm';
// import { Message } from '../messages/message.entity';

@Entity()
export class User extends BaseEntity {
  @PrimaryGeneratedColumn({ type: 'int' })
  userId: number;

  @Column({ type: 'varchar', nullable: false, unique: true })
  email: string;

  @Column({ type: 'varchar', nullable: false })
  name: string;

  @Column({ type: 'varchar', nullable: true })
  number: string[];

  @Column({ type: 'varchar', nullable: false })
  accessKey: string;

  @Column({ type: 'varchar', nullable: false })
  serviceId: string;

  @Column({ type: 'varchar', nullable: true })
  refreshToken: string;

  @Column({ type: 'varchar', nullable: false })
  advertisementOpt: boolean;

  // @OneToMany(() => Message,, (message) => message.user, { cascade: true })
  // messages: Messages[];
}
