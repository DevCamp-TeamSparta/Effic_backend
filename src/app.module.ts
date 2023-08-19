import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CongfigValidator } from '../config/db.config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { MessageModule } from './messages/messages.module';
import { UsersModule } from './users/users.module';
import { PaymentsModule } from './payments/payments.module';
import { ResultsModule } from './results/results.module';
import { ScheduleModule } from '@nestjs/schedule';

@Module({
  imports: [
    TypeOrmModule.forRoot(CongfigValidator),
    ScheduleModule.forRoot(),
    MessageModule,
    UsersModule,
    PaymentsModule,
    ResultsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
