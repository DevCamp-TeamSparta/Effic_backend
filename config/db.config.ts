import { TypeOrmModuleOptions } from "@nestjs/typeorm";
import "dotenv/config";

export const CongfigValidator: TypeOrmModuleOptions = {
  type: "postgres",
  host: process.env.PG_HOST,
  port: parseInt(process.env.PG_PORT),
  username: process.env.PG_USERNAME,
  password: process.env.PG_PASSWORD,
  database: process.env.PG_DB,
  entities: [__dirname + "/../**/*.entity.{js,ts}"],
  synchronize: true,
};
