import {
  CanActivate,
  ExecutionContext,
  Injectable,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import * as dotenv from 'dotenv';
import { AuthService } from '../service/auth.service';
import { jwtConfig } from 'config/jwt.config';
import { JwtService } from '@nestjs/jwt';
dotenv.config();

@Injectable()
export class AccessTokenGuard implements CanActivate {
  private logger = new Logger('AccessTokenGuard');
  constructor(
    private jwtService: JwtService,
    private authService: AuthService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    this.logger.verbose('AccessTokenGuard');
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
  private logger = new Logger('RefreshTokenGuard');
  constructor(
    private jwtService: JwtService,
    private authService: AuthService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    this.logger.verbose('RefreshTokenGuard');
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
