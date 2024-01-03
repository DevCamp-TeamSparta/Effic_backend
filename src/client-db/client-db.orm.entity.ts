import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('ClientDb')
export class ClientDbOrmEntity {
  @PrimaryGeneratedColumn()
  clientDbId: number;

  @Column()
  host: string;

  @Column()
  user: string;

  @Column()
  password: string;

  @Column()
  database: string;

  @Column()
  port: number;
}
