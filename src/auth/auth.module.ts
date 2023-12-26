import { Module } from '@nestjs/common';
import { AuthService } from './service/auth.service';
import { JwtService } from '@nestjs/jwt';

@Module({
  providers: [AuthService, JwtService],
})
export class AuthModule {}
