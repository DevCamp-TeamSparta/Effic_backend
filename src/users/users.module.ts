import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersController } from './controller/users.controller';
import { UsersService } from './service/users.service';
import { User } from './user.entity';
import {
  AllContactsRepository,
  PhonebookListRepository,
  UserNcpInfoRepository,
  UsersRepository,
} from './users.repository';

@Module({
  imports: [TypeOrmModule.forFeature([User])],
  controllers: [UsersController],
  providers: [
    UsersService,
    UsersRepository,
    UserNcpInfoRepository,
    AllContactsRepository,
    PhonebookListRepository,
  ],
  exports: [UsersService, UsersRepository, UserNcpInfoRepository],
})
export class UsersModule {}
