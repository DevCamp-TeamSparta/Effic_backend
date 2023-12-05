import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SegmentController } from './adapter/in-web/segment.controller';
import { ICreateSegmentPortSymbol } from './application/port/out/create-segment.port';
import { SegmentRepository } from './adapter/out-persistence/segment.repository';
import { ISegmentUseCaseSymbol } from './application/port/in/segment.use-case';
import { SegmentService } from './application/service/segment.service';
import { SegmentOrmEntity } from './adapter/out-persistence/segment.orm.entity';

@Module({
  imports: [TypeOrmModule.forFeature([SegmentOrmEntity])],
  controllers: [SegmentController],
  providers: [
    {
      provide: ICreateSegmentPortSymbol,
      useClass: SegmentRepository,
    },
    {
      provide: ISegmentUseCaseSymbol,
      useClass: SegmentService,
    },
  ],
})
export class SegmentModule {}
