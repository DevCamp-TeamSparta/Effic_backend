import {
  Controller,
  Get,
  Logger,
  Param,
  Headers,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { ResultsService } from '../service/results.service';
import * as jwt from 'jsonwebtoken';

@Controller('results')
export class ResultsController {
  private logger = new Logger('ResultsController');
  constructor(private resultsService: ResultsService) {}

  @Get('/:messageId')
  async messageResult(@Param('messageId') messageId: number) {
    this.logger.verbose('Message result');
    return await this.resultsService.messageResult(messageId);
  }

  @Get('/group/:messageId')
  async messageGroupResults(
    @Param('messageId') messageId: number,
    @Headers('Authorization') authorization: string,
  ) {
    if (!authorization) {
      throw new HttpException('Unauthorized', HttpStatus.UNAUTHORIZED);
    }
    const accessToken = authorization.split(' ')[1];
    const decodedAccessToken: any = jwt.decode(accessToken);
    this.logger.verbose('Message result');
    const result = await this.resultsService.messageGroupResult(
      messageId,
      decodedAccessToken.email,
    );
    return result;
  }

  @Get('/default/:messageId')
  async defaultMessageResult(@Param('messageId') messageId: number) {
    this.logger.verbose('Default message result');
    return await this.resultsService.shortUrlResult(messageId);
  }

  @Get('/default/ncp/:messageId')
  async defaultMessageNcpResult(
    @Param('messageId') messageId: number,
    @Headers('email') headerEmail: string,
  ) {
    this.logger.verbose('Default message ncp result');
    return await this.resultsService.ncpResult(messageId, headerEmail);
  }

  // @Get('/getUrlInfo')
  // async getUrlInfo() {
  //   this.logger.verbose('Get url info');
  //   const shorturl = 'kY0LNX';
  //   return await this.resultsService.getLinkInfo(shorturl);
  // }
}
