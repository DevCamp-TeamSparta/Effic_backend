import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { ConfigValidator } from "../config/db.config";
import { AppController } from "./app.controller";
import { AppService } from "./app.service";

@Module({
  imports: [TypeOrmModule.forRoot(ConfigValidator)],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
