import { PrimaryGeneratedColumn, Column, Entity, BaseEntity } from 'typeorm';

@Entity()
export class BizNcpResult extends BaseEntity {
  @PrimaryGeneratedColumn({ type: 'int' })
  ncpResultId: number;
}
