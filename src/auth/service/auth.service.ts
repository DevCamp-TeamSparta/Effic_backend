import { Injectable } from '@nestjs/common';
import { Request } from 'express';

@Injectable()
export class AuthService {
  /**
   * - req.header의 authorization 속성에서 빈칸을 기준으로 type과 token을 분리함
   *   - 만약 authorization 속성이 undefined나 null이라면 빈 배열을 return
   * - type이 Bearer이면 token을 return하고 그렇지 않으면 undefined를 return
   * @param req HTTP 요청 객체
   * @returns token | undefined
   */
  extractTokenFromHeader(req: Request): string | undefined {
    const [type, token] = req.headers.authorization?.split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
  }
}
