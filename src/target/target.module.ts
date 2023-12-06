import { Module } from '@nestjs/common';
import { TargetService } from './application/service/target.service';
import { TargetController } from './adapter/in-web/target.controller';
import { ISegmentPortSymbol } from 'src/segment/application/port/out/segment.port';
import { SegmentRepository } from 'src/segment/adapter/out-persistence/segment.repository';
import { ITargetUseCaseSymbol } from './application/port/in/target.use-case';
import { SegmentModule } from 'src/segment/segment.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SegmentOrmEntity } from 'src/segment/adapter/out-persistence/segment.orm.entity';
import { ITargetPortSymbol } from './application/port/out/target.port';
import { TargetRepository } from './adapter/out-persistence/repository/target.repository';
import { TargetOrmEntity } from './adapter/out-persistence/entity/target.orm.entity';
import { ISmsPortSymbol } from './application/port/out/sms.port';
import { SmsRepository } from './adapter/out-persistence/repository/sms.repository';
import { SmsOrmEntity } from './adapter/out-persistence/entity/sms.orm.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([SegmentOrmEntity, TargetOrmEntity, SmsOrmEntity]),
  ],
  controllers: [TargetController],
  providers: [
    {
      provide: ISegmentPortSymbol,
      useClass: SegmentRepository,
    },
    {
      provide: ITargetUseCaseSymbol,
      useClass: TargetService,
    },
    {
      provide: ITargetPortSymbol,
      useClass: TargetRepository,
    },
    {
      provide: ISmsPortSymbol,
      useClass: SmsRepository,
    },
  ],
})
export class TargetModule {}
