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
import { PhonebookModule } from './phonebook/phonebook.module';
import { AuthGuard } from './auth.guard';

@Module({
  imports: [
    TypeOrmModule.forRoot(CongfigValidator),
    MessageModule,
    UsersModule,
    PaymentsModule,
    ResultsModule,
    ScheduleModule.forRoot(),
    PhonebookModule,
  ],
  controllers: [AppController],
  providers: [AppService, AuthGuard],
})
export class AppModule {}
