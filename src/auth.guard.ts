import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import * as jwt from 'jsonwebtoken';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const authorization = request.headers.authorization;

    if (!authorization) {
      return false;
    }

    try {
      const accessToken = authorization.split(' ')[1];
      const decodedAccessToken: any = jwt.decode(accessToken);

      if (!decodedAccessToken || !decodedAccessToken.email) {
        return false;
      }

      request.user = decodedAccessToken;
      return true;
    } catch (error) {
      return false;
    }
  }
}
