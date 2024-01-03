import { ClientDbOrmEntity } from 'src/client-db/client-db.orm.entity';
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

  @ManyToOne(() => ClientDbOrmEntity)
  @JoinColumn({ name: 'clinetDbId' })
  clientDbId: number;
}
