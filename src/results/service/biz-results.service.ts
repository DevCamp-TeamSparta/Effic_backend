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
import { ShorturlService } from 'src/shorturl/service/shorturl.service';
import { UsersService } from 'src/users/service/users.service';
import { bizmessageType } from 'src/bizmessage/bizmessage.enum';
import { BizNcpResult, BizUrlResult } from '../entity/biz-result.entity';
import * as crypto from 'crypto';
import axios from 'axios';
import { Cron } from '@nestjs/schedule';

@Injectable()
export class BizmessageResultsService {
  private logger = new Logger('BizmessageResultsService');
  constructor(
    private readonly bizmessageService: BizmessageService,
    private readonly usersService: UsersService,
    private readonly shorturlService: ShorturlService,
    private readonly bizmessageNcpResultsRepository: BizmessageNcpResultsRepository,
    @InjectEntityManager() private readonly entityManager: EntityManager,
  ) {}

  // ncp 결과
  async ncpResult(bizmessageId: number, userId: number): Promise<any> {
    const bizmessage =
      await this.bizmessageService.findOneBizmessageInfoByBizmessageId(
        bizmessageId,
      );
    const user = await this.usersService.findUserByUserId(userId);
    const userNcpInfo = await this.usersService.findUserNcpInfoByUserId(userId);
    const bizmessageContent =
      await this.bizmessageService.findOneBizmessageContentByBizmessageId(
        bizmessageId,
      );

    if (!bizmessage || !user) {
      throw new BadRequestException('Invalid request');
    }

    if (bizmessage.sentTpye === bizmessageType.N) {
      return { success: 0, reserved: bizmessage.receiverList.length, fail: 0 };
    }

    let success = 0;
    let fail = 0;
    let reserved = 0;

    for (const requestId of bizmessage.ncpRequestIdList) {
      const now = Date.now().toString();
      const headers = {
        'x-ncp-apigw-timestamp': now,
        'x-ncp-iam-access-key': userNcpInfo.accessKey,
        'x-ncp-apigw-signature-v2': await this.makeSignature(
          userNcpInfo,
          bizmessageContent.plusFriendId,
          requestId,
          now,
        ),
      };

      try {
        const response = await axios.get(
          `https://sens.apigw.ntruss.com/friendtalk/v2/services/${userNcpInfo.bizServiceId}/messages?requestId=${requestId}`,
          { headers },
        );

        for (let i = 0; i < response.data.itemCount; i++) {
          if (response.data.messages[i].messageStatusName === 'success') {
            success++;
          } else if (response.data.messages[i].messageStatusName === 'fail') {
            fail++;
          } else if (
            response.data.messages[i].messageStatusName === 'processing'
          ) {
            reserved++;
          }
        }
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
    return { success, reserved, fail };
  }

  async makeSignature(userNcpInfo, plusFriendId, requestId, timestamp) {
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

  // 단축 url 결과
  async shortUrlResult(bizmessageId: number): Promise<any> {
    const bizmessage =
      await this.bizmessageService.findOneBizmessageInfoByBizmessageId(
        bizmessageId,
      );
    if (!bizmessage) {
      throw new BadRequestException('bizmessageId is wrong');
    }

    if (bizmessage.sentTpye === bizmessageType.N) {
      return [];
    }

    const statisticsArray = [];

    for (const idString of bizmessage.idStringList) {
      statisticsArray.push({
        ...(await this.shorturlService.getShorturlResult(idString)),
        idString,
      });
    }
    return statisticsArray;
  }

  // 친구톡 결과조회
  async BizmessageResult(bizmessageId: number, userId: number): Promise<any> {
    const bizmessage =
      await this.bizmessageService.findOneBizmessageInfoByBizmessageId(
        bizmessageId,
      );
    const user = await this.usersService.findUserByUserId(userId);
    const newBizNcpResult = await this.ncpResult(bizmessageId, userId);

    const resultEntity = this.entityManager.create(BizNcpResult, {
      bizmessage: bizmessage,
      success: newBizNcpResult.success,
      reserved: newBizNcpResult.reserved,
      fail: newBizNcpResult.fail,
      createdAt: new Date(),
      user: user,
    });

    const bizNcpResultId = (await this.entityManager.save(resultEntity))
      .BizNcpResultId;

    const newBizUrlResult = await this.shortUrlResult(bizmessageId);

    for (const result of newBizUrlResult) {
      const resultEntity = this.entityManager.create(BizUrlResult, {
        bizmessage: bizmessage,
        humanclicks: result.humanclicks,
        totalclicks: result.totalclicks,
        idString: result.idString,
        BizNcpResultId: bizNcpResultId,
        user: user,
      });
      await this.entityManager.save(resultEntity);
    }
    // const
  }

  // 친구톡 결과 polling
  @Cron('30 */1 * * *', { name: 'bizmessageResultPolling' })
  async handlebizmessageResultPolling() {
    this.logger.log('bizmessageResultPolling');
    const bizmessages = await this.bizmessageService.findThreeDaysBeforeSend();

    for (const bizmessage of bizmessages) {
      const user = await this.usersService.findUserByUserId(bizmessage.userId);

      try {
        const ncpResult = await this.ncpResult(
          bizmessage.bizmessageId,
          user.userId,
        );

        const resultEntity = this.entityManager.create(BizNcpResult, {
          bizmessage: bizmessage,
          success: ncpResult.success,
          reserved: ncpResult.reserved,
          fail: ncpResult.fail,
          createdAt: new Date(),
          user: user,
        });

        const bizNcpResultId = (await this.entityManager.save(resultEntity))
          .BizNcpResultId;

        console.log(
          `NCP results for bizmessage ${bizmessage.bizmessageId} saved`,
        );

        if (bizmessage.createdAt > new Date(Date.now() - 24 * 60 * 60 * 1000)) {
          try {
            const shortUrlResults = await this.shortUrlResult(
              bizmessage.bizmessageId,
            );

            for (const result of shortUrlResults) {
              const resultEntity = this.entityManager.create(BizUrlResult, {
                bizmessage: bizmessage,
                humanclicks: result.humanclicks,
                totalclicks: result.totalclicks,
                idString: result.idString,
                BizNcpResultId: bizNcpResultId,
                user: user,
              });
              await this.entityManager.save(resultEntity);
            }
            console.log(
              `Short url results for bizmessage ${bizmessage.bizmessageId} saved.`,
            );
          } catch (error) {
            console.error(
              `Failed to fetch short url results for bizmessage ${bizmessage.bizmessageId}`,
              error,
            );
          }
        }
      } catch (error) {
        console.log(
          `Failed to fetch NCP results for message ${bizmessage.bizmessageId}`,
          error,
        );
      }
    }
  }
}
