import { Module } from '@nestjs/common';
import { AutoMessageEventService } from './application/service/auto-message-event.service';
import { AutoMessageEventController } from './adapter/in-web/auto-message-event.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AutoMessageEventOrmEntity } from './adapter/out-persistence/auto-message-event.orm.entity';
import { IAutoMessageEventPortSymbol } from './application/port/out/auto-message-event.port';
import { AutoMessageEventRepository } from './adapter/out-persistence/auto-message-event.repository';
import { IAutoMessageEventUseCaseSymbol } from './application/port/in/auto-message-event.use-case';

@Module({
  imports: [TypeOrmModule.forFeature([AutoMessageEventOrmEntity])],
  controllers: [AutoMessageEventController],
  providers: [
    {
      provide: IAutoMessageEventPortSymbol,
      useClass: AutoMessageEventRepository,
    },
    {
      provide: IAutoMessageEventUseCaseSymbol,
      useClass: AutoMessageEventService,
    },
  ],
})
export class AutoMessageEventModule {}
