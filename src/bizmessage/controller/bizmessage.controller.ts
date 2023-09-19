import { Controller, Logger, Post, Headers } from '@nestjs/common';
import { BizmessageService } from '../service/bizmessage.service';
import * as jwt from 'jsonwebtoken';

@Controller('bizmessage')
export class BizmessageController {
  private logger = new Logger('BizmessageController');
  constructor(private bizmessageService: BizmessageService) {}

  // 기본 친구톡 보내기
  @Post('/default')
  async sendDefaultBizmessage(@Headers('Authorization') authorization: string) {
    this.logger.verbose('Default bizmessage sending');

    const accessToken = authorization.split(' ')[1];
    const decodedAccessToken: any = jwt.decode(accessToken);

    const email = decodedAccessToken.email;
  }
}
