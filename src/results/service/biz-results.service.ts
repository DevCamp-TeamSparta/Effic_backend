import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
  HttpException,
  HttpStatus,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectEntityManager } from '@nestjs/typeorm';
import { EntityManager } from 'typeorm';
import { BizmessageNcpResultsRepository } from '../repository/biz-result.repository';
import { BizmessageService } from 'src/bizmessage/service/bizmessage.service';
import { UsersService } from 'src/users/service/users.service';
import { bizmessageType } from 'src/bizmessage/bizmessage.enum';
import * as crypto from 'crypto';
import axios from 'axios';

@Injectable()
export class BizmessageResultsService {
  private logger = new Logger('BizmessageResultsService');
  constructor(
    private readonly bizmessageService: BizmessageService,
    private readonly usersService: UsersService,
    private readonly bizmessageNcpResultsRepository: BizmessageNcpResultsRepository,
    @InjectEntityManager() private readonly entityManager: EntityManager,
  ) {}

  // ncp 결과
  async ncpResult(bizmessageId: number, userId: number): Promise<any> {
    const bizmessage =
      await this.bizmessageService.findBizmessageInfoByBizmessageId(
        bizmessageId,
      );
    const user = await this.usersService.findUserByUserId(userId);
    const userNcpInfo = await this.usersService.findUserNcpInfoByUserId(userId);

    if (!bizmessage || !user) {
      throw new BadRequestException('Invalid request');
    }

    if (bizmessage.sentTpye === bizmessageType.N) {
      return { success: 0, reserved: bizmessage.receiverList.length, fail: 0 };
    }

    const success = 0;
    const fail = 0;
    const reserved = 0;

    for (const requestId of bizmessage.ncpRequestIdList) {
      const now = Date.now().toString();
      const headers = {
        'x-ncp-apigw-timestamp': now,
        'x-ncp-iam-access-key': userNcpInfo.accessKey,
        'x-ncp-apigw-signature-v2': await this.makeSignature(
          userNcpInfo,
          requestId,
          now,
        ),
      };

      try {
        //   const response = axios.get(
        //     `https://sens.apigw.ntruss.com/friendtalk/v2/services/${userNcpInfo.bizServiceId}/messages?requestId=${requestId}&plusFriendId=${bizmessage.plusFriendId}`,
        //     { headers },
        //   );
        //   console.log(response);
        // for (let i = 0; i < response.data.itemCount; i++) {
        //   if (response.data.messages[i].statusName === 'success') {
        //     success++;
        //   } else if (response.data.messages[i].statusName === 'fail') {
        //     fail++;
        //   } else if (response.data.messages[i].statusName === 'reserved') {
        //     reserved++;
        //   }
        // }
      } catch (error) {
        if (error.response) {
          throw new HttpException(error.response.data, error.response.status);
        }
        throw new HttpException(
          error.message,
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }
    }
    throw new HttpException(
      'Internal server error',
      HttpStatus.INTERNAL_SERVER_ERROR,
    );
  }

  async makeSignature(userNcpInfo, requestId, timestamp) {
    const message = [];
    const hmac = crypto.createHmac('sha256', userNcpInfo.secretKey);
    const space = ' ';
    const newLine = '\n';
    const method = 'GET';
    message.push(method);
    message.push(space);
    message.push(
      `/friendtalk/v2/services/${userNcpInfo.bizServiceId}/messages?requestId=${requestId}`,
    );
    message.push(newLine);
    message.push(timestamp);
    message.push(newLine);
    message.push(userNcpInfo.accessKey);

    const signature = hmac.update(message.join('')).digest('base64');
    return signature.toString();
  }
  //
}
