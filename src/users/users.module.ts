import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersController } from './controller/users.controller';
import { UsersService } from './service/users.service';
import { User } from './user.entity';
import { UserNcpInfoRepository, UsersRepository } from './users.repository';
import { AuthService } from 'src/auth/service/auth.service';
import { JwtService } from '@nestjs/jwt';

@Module({
  imports: [TypeOrmModule.forFeature([User])],
  controllers: [UsersController],
  providers: [
    UsersService,
    UsersRepository,
    UserNcpInfoRepository,
    AuthService,
    JwtService,
  ],
  exports: [UsersService, UsersRepository, UserNcpInfoRepository],
})
export class UsersModule {}
