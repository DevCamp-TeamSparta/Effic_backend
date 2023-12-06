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
import { TargetRepository } from './adapter/out-persistence/target.repository';
import { TargetOrmEntity } from './adapter/out-persistence/target.orm.entity';

@Module({
  imports: [TypeOrmModule.forFeature([SegmentOrmEntity, TargetOrmEntity])],
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
  ],
})
export class TargetModule {}
