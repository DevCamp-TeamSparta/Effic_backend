import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SegmentController } from './adapter/in-web/segment.controller';
import { SegmentRepository } from './adapter/out-persistence/segment.repository';
import { ISegmentUseCaseSymbol } from './application/port/in/segment.use-case';
import { SegmentService } from './application/service/segment.service';
import { SegmentOrmEntity } from './adapter/out-persistence/segment.orm.entity';
import { ISegmentPortSymbol } from './application/port/out/segment.port';
import { MessageHistoryOrmEntity } from './adapter/out-persistence/message-history.orm.entity';
import { JwtService } from '@nestjs/jwt';
import { AuthService } from 'src/auth/service/auth.service';
import { UsersService } from 'src/users/service/users.service';
import {
  UserNcpInfoRepository,
  UsersRepository,
} from 'src/users/users.repository';

@Module({
  imports: [
    TypeOrmModule.forFeature([SegmentOrmEntity, MessageHistoryOrmEntity]),
  ],
  controllers: [SegmentController],
  providers: [
    JwtService,
    AuthService,
    UsersService,
    UsersRepository,
    UserNcpInfoRepository,
    {
      provide: ISegmentPortSymbol,
      useClass: SegmentRepository,
    },
    {
      provide: ISegmentUseCaseSymbol,
      useClass: SegmentService,
    },
  ],
  exports: [ISegmentPortSymbol],
})
export class SegmentModule {}
