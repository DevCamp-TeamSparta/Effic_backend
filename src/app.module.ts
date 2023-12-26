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
import { BizmessageModule } from './bizmessage/bizmessage.module';
import { ShorturlModule } from './shorturl/shorturl.module';
import { SegmentModule } from './segment/segment.module';
import { ClientDbModule } from './client-db/client-db.module';
import { TargetModule } from './target/target.module';
import { AutoMessageEventModule } from './auto-message-event/auto-message-event.module';
import { AuthModule } from './auth/auth.module';

@Module({
  imports: [
    TypeOrmModule.forRoot(CongfigValidator),
    MessageModule,
    UsersModule,
    PaymentsModule,
    ResultsModule,
    ScheduleModule.forRoot(),
    PhonebookModule,
    BizmessageModule,
    ShorturlModule,
    SegmentModule,
    ClientDbModule,
    TargetModule,
    AutoMessageEventModule,
    AuthModule,
  ],
  controllers: [AppController],
  providers: [AppService, AuthGuard],
})
export class AppModule {}
