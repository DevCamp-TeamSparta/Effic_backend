import {
  Injectable,
  InternalServerErrorException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { InjectEntityManager } from '@nestjs/typeorm';
import { MessagesRepository } from 'src/messages/messages.repository';
import { UsersRepository } from 'src/users/users.repository';
import { ResultsRepository } from '../results.repository';
import { Result } from '../result.entity';
import { EntityManager } from 'typeorm';
import axios from 'axios';
import * as crypto from 'crypto';
import { shortIoConfig } from 'config/short-io.config';
import { Cron } from '@nestjs/schedule';

@Injectable()
export class ResultsService {
  private logger = new Logger('ResultsService');
  constructor(
    private readonly usersRepository: UsersRepository,
    private readonly messagesRepository: MessagesRepository,
    private readonly resultsRepository: ResultsRepository,
    @InjectEntityManager() private readonly entityManager: EntityManager,
  ) {}

  // 기본메세지 ncp 결과
  async ncpResult(messageId: number, email: string): Promise<any> {
    const message = await this.messagesRepository.findOneByMessageId(messageId);
    const user = await this.usersRepository.findOneByEmail(email);

    if (!message || !user) {
      throw new BadRequestException('messageId or email is wrong');
    }

    const now = Date.now().toString();
    const headers = {
      'x-ncp-apigw-timestamp': now,
      'x-ncp-iam-access-key': user.accessKey,
      'x-ncp-apigw-signature-v2': await this.signature(user, message, now),
    };

    try {
      const response = await axios.get(
        `https://sens.apigw.ntruss.com/sms/v2/services/${user.serviceId}/messages?requestId=${message.requestId}`,
        { headers },
      );

      console.log(response.data);

      let success = 0;
      let fail = 0;
      let reserved = 0;

      for (let i = 0; i < response.data.itemCount; i++) {
        if (response.data.messages[i].statusName === 'success') {
          success++;
        } else if (response.data.messages[i].statusName === 'fail') {
          fail++;
        } else if (response.data.messages[i].statusName === 'reserved') {
          reserved++;
        }
      }
      return { success, reserved, fail };
    } catch (e) {
      console.log(e.response.data);
      throw new InternalServerErrorException();
    }
  }

  // 단축 url 결과
  async shortUrlResult(messageId: number) {
    const message = await this.messagesRepository.findOneByMessageId(messageId);
    if (!message) {
      throw new BadRequestException('messageId is wrong');
    }

    const statisticsArray = [];

    for (const shortUrl of message.shortUrl) {
      try {
        const response = await axios.get(
          `https://api-v2.short.io/statistics/link/${shortUrl}`,
          {
            params: {
              period: 'week',
              tzOffset: '0',
            },
            headers: {
              accept: '*/*',
              authorization: shortIoConfig.secretKey,
            },
          },
        );

        const totalClicks = response.data.totalClicks;
        const humanClicks = response.data.humanClicks;

        statisticsArray.push({ totalClicks, humanClicks, shortUrl });
      } catch (error) {
        console.log(error);
        throw new InternalServerErrorException();
      }
    }
    return statisticsArray;
  }

  async signature(user, messageId, timestamp) {
    const message = [];
    const hmac = crypto.createHmac('sha256', user.secretKey);
    const space = ' ';
    const newLine = '\n';
    const method = 'GET';
    message.push(method);
    message.push(space);
    message.push(
      `/sms/v2/services/${user.serviceId}/messages?requestId=${messageId.requestId}`,
    );
    message.push(newLine);
    message.push(timestamp);
    message.push(newLine);
    message.push(user.accessKey);

    const signature = hmac.update(message.join('')).digest('base64');
    return signature.toString();
  }

  // 메세지별 결과 (유저정보 + polling 결과)
  async messageResult(messageId: number): Promise<Result[]> {
    const message = await this.resultsRepository.findAllByMessageId(messageId);
    if (!message) {
      throw new BadRequestException('messageId is wrong');
    }

    const user = await this.usersRepository.findOneByUserId(message[0].userId);
    const result = await this.resultsRepository.findAllByMessageId(messageId);
    result[0].user = user;
    return result;
  }

  @Cron('0 */1 * * *')
  async handleNcpCron() {
    this.logger.log('ncp polling');
    const messages = await this.messagesRepository.findThreeDaysBeforeSend();
    this.logger.log(messages);

    for (const message of messages) {
      const user = await this.usersRepository.findOneByUserId(message.userId);

      try {
        const ncpResult = await this.ncpResult(message.messageId, user.email);

        const resultEntity = this.entityManager.create(Result, {
          message: message,
          success: ncpResult.success,
          reserved: ncpResult.reserved,
          fail: ncpResult.fail,
          user: user,
        });

        await this.entityManager.save(resultEntity);

        console.log(`NCP results for message ${message.messageId} saved.`);
      } catch (error) {
        console.error(
          `Failed to fetch NCP results for message ${message.messageId}.`,
          error,
        );
      }
    }
  }

  @Cron('0 */1 * * *')
  // @Cron(CronExpression.EVERY_10_MINUTES)
  async handleUrlCron() {
    this.logger.log('url polling');
    const messages =
      await this.messagesRepository.findTwentyFourHoursBeforeSend();
    this.logger.log(messages);

    for (const message of messages) {
      const user = await this.usersRepository.findOneByUserId(message.userId);

      try {
        const shortUrlResult = await this.shortUrlResult(message.messageId);

        for (const result of shortUrlResult) {
          const resultEntity = this.entityManager.create(Result, {
            message: message,
            totalClicks: result.totalClicks,
            humanClicks: result.humanClicks,
            user: user,
            shortUrl: result.shortUrl,
          });

          await this.entityManager.save(resultEntity);
        }

        console.log(
          `Short url results for message ${message.messageId} saved.`,
        );
      } catch (error) {
        console.error(
          `Failed to fetch short url results for message ${message.messageId}.`,
          error,
        );
      }
    }
  }
}
