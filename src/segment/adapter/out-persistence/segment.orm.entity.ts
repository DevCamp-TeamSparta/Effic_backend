import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('Segment')
export class SegmentOrmEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  segmentName: string;

  @Column()
  segmentDescription: string;

  @Column({ nullable: true })
  segmentQuery: string | null;

  @Column({ nullable: true })
  filterQuery: string | null;
}
