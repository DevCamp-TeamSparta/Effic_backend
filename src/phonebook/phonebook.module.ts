import { Module } from '@nestjs/common';
import { PhonebookController } from './controller/phonebook.controller';
import { PhonebookService } from './service/phonebook.service';
import { PhonebookList } from './phonebook.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import {
  AllContactsRepository,
  PhonebookListRepository,
} from './phonebook.repository';
import { UsersService } from 'src/users/service/users.service';
import {
  UserNcpInfoRepository,
  UsersRepository,
} from 'src/users/users.repository';

@Module({
  imports: [TypeOrmModule.forFeature([PhonebookList])],
  controllers: [PhonebookController],
  providers: [
    PhonebookService,
    PhonebookListRepository,
    PhonebookListRepository,
    AllContactsRepository,
    UsersService,
    UsersRepository,
    UserNcpInfoRepository,
  ],
  exports: [PhonebookService, PhonebookListRepository],
})
export class PhonebookModule {}
