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

  @Get('/group')
  async getAllMessageGroupResult(
    @Headers('Authorization') authorization: string,
  ) {
    if (!authorization) {
      throw new HttpException('Unauthorized', HttpStatus.UNAUTHORIZED);
    }
    const accessToken = authorization.split(' ')[1];
    const decodedAccessToken: any = jwt.decode(accessToken);
    this.logger.verbose('Message group result');
    const result = await this.resultsService.allMessageGroupResult(
      decodedAccessToken.email,
    );
    return {
      result,
    };
  }

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
    this.logger.verbose('Message group result');
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

  // 사용 내역 조회
  @Get('/payment/:userId')
  async paymentResult(
    @Param('userId') userId: number,
    @Headers('Authorization') Authorization: string,
  ) {
    this.logger.verbose('Payment result');
    if (!Authorization) {
      throw new HttpException('Unauthorized', HttpStatus.UNAUTHORIZED);
    }
    const accessToken = Authorization.split(' ')[1];
    const decodedAccessToken: any = jwt.decode(accessToken);

    this.logger.verbose('Payment result');
    return await this.resultsService.paymentResult(
      userId,
      decodedAccessToken.email,
    );
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
}
