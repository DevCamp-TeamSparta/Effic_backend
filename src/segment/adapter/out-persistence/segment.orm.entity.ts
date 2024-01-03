import { User } from 'src/users/user.entity';
import {
  Column,
  Entity,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';

@Entity('Segment')
export class SegmentOrmEntity {
  @PrimaryGeneratedColumn()
  segmentId: number;

  @Column()
  segmentName: string;

  @Column()
  segmentDescription: string;

  @Column({ nullable: true })
  segmentQuery: string | null;

  @Column({ nullable: true })
  filterQuery: string | null;

  @Column({ nullable: true })
  createdAt: Date;

  @Column({ nullable: true })
  updatedAt: Date;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column({ name: 'userId' })
  userId: number;

  /**고객 DB 관련 정보 */
  @Column({ nullable: true })
  host?: string;

  @Column({ nullable: true })
  username?: string;

  @Column({ nullable: true })
  password?: string;

  @Column({ nullable: true })
  database?: string;

  @Column({ nullable: true })
  port?: number;
}
