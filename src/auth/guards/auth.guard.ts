import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import * as dotenv from 'dotenv';
import { AuthService } from '../service/auth.service';
import { jwtConfig } from 'config/jwt.config';
import { JwtService } from '@nestjs/jwt';
dotenv.config();

@Injectable()
export class AccessTokenGuard implements CanActivate {
  constructor(
    private jwtService: JwtService,
    private authService: AuthService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest();
    const token = this.authService.extractTokenFromHeader(req);
    if (!token) throw new UnauthorizedException('AccessToken Error');

    const payload = await this.jwtService.verifyAsync(token, {
      secret: jwtConfig.secretKey,
    });

    req.payload = payload;
    return true;
  }
}

@Injectable()
export class RefreshTokenGuard implements CanActivate {
  constructor(
    private jwtService: JwtService,
    private authService: AuthService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest();

    const token = this.authService.extractTokenFromHeader(req);
    if (!token) throw new UnauthorizedException('RefreshToken이 만료됨');

    const payload = await this.jwtService.verifyAsync(token, {
      secret: jwtConfig.secretKey,
    });

    req.payload = payload;

    return true;
  }
}
