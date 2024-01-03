import { Module } from '@nestjs/common';
import { TargetService } from './application/service/target.service';
import { TargetController } from './adapter/in-web/target.controller';
import { ISegmentPortSymbol } from 'src/segment/application/port/out/segment.port';
import { SegmentRepository } from 'src/segment/adapter/out-persistence/segment.repository';
import { ITargetUseCaseSymbol } from './application/port/in/target.use-case';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SegmentOrmEntity } from 'src/segment/adapter/out-persistence/segment.orm.entity';
import { ITargetPortSymbol } from './application/port/out/target.port';
import { TargetRepository } from './adapter/out-persistence/target.repository';
import { MessageHistoryOrmEntity } from 'src/segment/adapter/out-persistence/message-history.orm.entity';
import { TargetOrmEntity } from './adapter/out-persistence/target.orm.entity';
import { ISegmentUseCaseSymbol } from 'src/segment/application/port/in/segment.use-case';
import { SegmentService } from 'src/segment/application/service/segment.service';
import {
  UserNcpInfoRepository,
  UsersRepository,
} from 'src/users/users.repository';
import { UsersService } from 'src/users/service/users.service';
import { AuthService } from 'src/auth/service/auth.service';
import { JwtService } from '@nestjs/jwt';
import { IAutoMessageEventPortSymbol } from 'src/auto-message-event/application/port/out/auto-message-event.port';
import { AutoMessageEventRepository } from 'src/auto-message-event/adapter/out-persistence/auto-message-event.repository';
import { AutoMessageEventOrmEntity } from 'src/auto-message-event/adapter/out-persistence/auto-message-event.orm.entity';
import { IClientDbPortSymbol } from 'src/client-db/client-db.port';
import { ClinetDbRepository } from 'src/client-db/client-db.repository';
import { ClientDbOrmEntity } from 'src/client-db/client-db.orm.entity';
import { MessageModule } from 'src/messages/messages.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      SegmentOrmEntity,
      TargetOrmEntity,
      MessageHistoryOrmEntity,
      AutoMessageEventOrmEntity,
      ClientDbOrmEntity,
    ]),
    MessageModule,
  ],
  controllers: [TargetController],
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
    {
      provide: ITargetUseCaseSymbol,
      useClass: TargetService,
    },
    {
      provide: ITargetPortSymbol,
      useClass: TargetRepository,
    },
    {
      provide: IAutoMessageEventPortSymbol,
      useClass: AutoMessageEventRepository,
    },
    {
      provide: IClientDbPortSymbol,
      useClass: ClinetDbRepository,
    },
  ],
})
export class TargetModule {}
