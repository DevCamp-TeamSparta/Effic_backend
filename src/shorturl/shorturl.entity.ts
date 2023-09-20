import {
  BaseEntity,
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToOne,
  JoinColumn,
} from 'typeorm';

@Entity()
export class TlyUrlInfo extends BaseEntity {
  @Column({ type: 'varchar', nullable: false })
  idString: string;

  @Column({ type: 'varchar', nullable: false })
  originalUrl: string;

  @Column({ type: 'varchar', nullable: false })
  shortenUrl: string;

  @Column({ type: 'varchar', nullable: false, primary: true })
  firstShortenId: string;
}
@Entity()
export class UrlInfo extends BaseEntity {
  @PrimaryGeneratedColumn({ type: 'int' })
  urlInfoId: number;

  @Column({ type: 'varchar', nullable: false })
  originalUrl: string;

  @Column({ type: 'varchar', nullable: false })
  shortenUrl: string;

  @Column({ type: 'varchar', nullable: false })
  idString: string;

  @OneToOne(() => TlyUrlInfo)
  @JoinColumn({
    name: 'idString',
    referencedColumnName: 'firstShortenId',
    foreignKeyConstraintName: 'firstShortenId',
  })
  tlyUrlInfo: TlyUrlInfo;
}
