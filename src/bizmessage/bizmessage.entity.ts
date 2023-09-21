import { BaseEntity, Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Bizmessage extends BaseEntity {
  @PrimaryGeneratedColumn({ type: 'int' })
  bizmessageId: number;
}
