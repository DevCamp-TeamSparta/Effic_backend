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
import { BizmessageResultsService } from '../service/biz-results.service';

@Controller('results')
export class ResultsController {
  private logger = new Logger('ResultsController');
  constructor(
    private readonly resultsService: ResultsService,
    private readonly bizmessageResultsService: BizmessageResultsService,
  ) {}

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
  @Get('/payment/me')
  async paymentResult(@Headers('Authorization') Authorization: string) {
    this.logger.verbose('Payment result');
    if (!Authorization) {
      throw new HttpException('Unauthorized', HttpStatus.UNAUTHORIZED);
    }
    const accessToken = Authorization.split(' ')[1];
    const decodedAccessToken: any = jwt.decode(accessToken);

    this.logger.verbose('Payment result');
    return await this.resultsService.paymentResult(decodedAccessToken.email);
  }

  @Get('/default/:messageId')
  async defaultMessageResult(@Param('messageId') messageId: number) {
    this.logger.verbose('Default message result');
    return await this.resultsService.shortUrlResult(messageId);
  }

  //test용입니다. 실제로 사용되지 않습니다.
  @Get('/default/ncp/:messageId')
  async defaultMessageNcpResult(
    @Param('messageId') messageId: number,
    @Headers('email') headerEmail: string,
  ) {
    this.logger.verbose('Default message ncp result');
    return await this.resultsService.ncpResult(messageId, headerEmail);
  }

  // 친구톡 ncp 결과조회 - 실제로 사용되지 않습니다.
  @Get('/bizmessage/ncp/:bizmessageId')
  async bizmessageNcpResult(
    @Param('bizmessageId') bizmessageId: number,
    @Headers('Authorization') authorization: string,
  ) {
    this.logger.verbose('Bizmessage ncp result');
    if (!authorization) {
      throw new HttpException('Unauthorized', HttpStatus.UNAUTHORIZED);
    }
    const accessToken = authorization.split(' ')[1];
    const decodedAccessToken: any = jwt.decode(accessToken);

    return await this.bizmessageResultsService.ncpResult(
      bizmessageId,
      decodedAccessToken.userId,
    );
  }

  // 친구톡 url 클릭 결과조회 - 실제로 사용되지 않습니다
  @Get('/bizmessage/url/:bizmessageId')
  async bizmessageUrlResult(
    @Param('bizmessageId') bizmessageId: number,
    @Headers('Authorization') authorization: string,
  ) {
    this.logger.verbose('Bizmessage url result');
    if (!authorization) {
      throw new HttpException('Unauthorized', HttpStatus.UNAUTHORIZED);
    }

    return await this.bizmessageResultsService.shortUrlResult(bizmessageId);
  }

  // 친구톡 결과조회
  @Get('/bizmessage/:bizmessageId')
  async bizmessageResult(
    @Param('bizmessageId') bizmessageId: number,
    @Headers('Authorization') authorization: string,
  ) {
    this.logger.verbose('Bizmessage result');
    if (!authorization) {
      throw new HttpException('Unauthorized', HttpStatus.UNAUTHORIZED);
    }
    const accessToken = authorization.split(' ')[1];
    const decodedAccessToken: any = jwt.decode(accessToken);

    return await this.bizmessageResultsService.BizmessageResult(
      bizmessageId,
      decodedAccessToken.userId,
    );
  }
}
