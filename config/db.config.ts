import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import 'dotenv/config';
import { DataSource } from 'typeorm';

export const CongfigValidator: TypeOrmModuleOptions = {
  type: 'postgres',
  host: process.env.PG_HOST,
  port: parseInt(process.env.PG_PORT),
  username: process.env.PG_USERNAME,
  password: process.env.PG_PASSWORD,
  database: process.env.PG_DB,
  entities: ['dist/**/*.entity{.ts,.js}'],
  synchronize: false,
  migrations: ['src/database/migrations/*.ts'],
  migrationsTableName: 'migrations',
};

// export default new DataSource({
//   type: 'postgres',
//   host: process.env.PG_HOST,
//   port: parseInt(process.env.PG_PORT),
//   username: process.env.PG_USERNAME,
//   password: process.env.PG_PASSWORD,
//   database: process.env.PG_DB,
//   entities: ['dist/**/*.entity{.ts,.js}'],
//   synchronize: false,
//   migrations: ['src/database/migrations/*.ts'],
//   migrationsTableName: 'migrations',
// });
