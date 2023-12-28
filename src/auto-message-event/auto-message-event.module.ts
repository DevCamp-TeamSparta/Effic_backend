import { Module } from '@nestjs/common';
import { AutoMessageEventService } from './application/service/auto-message-event.service';
import { AutoMessageEventController } from './adapter/in-web/auto-message-event.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AutoMessageEventOrmEntity } from './adapter/out-persistence/auto-message-event.orm.entity';
import { IAutoMessageEventPortSymbol } from './application/port/out/auto-message-event.port';
import { AutoMessageEventRepository } from './adapter/out-persistence/auto-message-event.repository';
import { IAutoMessageEventUseCaseSymbol } from './application/port/in/auto-message-event.use-case';
import {
  UserNcpInfoRepository,
  UsersRepository,
} from 'src/users/users.repository';
import { UsersService } from 'src/users/service/users.service';
import { AuthService } from 'src/auth/service/auth.service';
import { JwtService } from '@nestjs/jwt';

@Module({
  imports: [TypeOrmModule.forFeature([AutoMessageEventOrmEntity])],
  controllers: [AutoMessageEventController],
  providers: [
    JwtService,
    AuthService,
    UsersService,
    UsersRepository,
    UserNcpInfoRepository,
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
