import {
  Injectable,
  InternalServerErrorException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { InjectEntityManager } from '@nestjs/typeorm';
import {
  MessageGroupRepo,
  MessagesRepository,
  UrlInfosRepository,
} from 'src/messages/messages.repository';
import { UsersRepository } from 'src/users/users.repository';
import { NcpResult, UrlResult } from '../result.entity';
import { UrlResultsRepository } from '../results.repository';
import { NcpResultsRepository } from '../results.repository';
import { MessagesContentRepository } from 'src/messages/messages.repository';
import { EntityManager } from 'typeorm';
import axios from 'axios';
import * as crypto from 'crypto';
import { shortIoConfig } from 'config/short-io.config';
import { Cron } from '@nestjs/schedule';
import { MessageType } from 'src/messages/message.enum';

@Injectable()
export class ResultsService {
  private logger = new Logger('ResultsService');
  constructor(
    private readonly usersRepository: UsersRepository,
    private readonly messagesRepository: MessagesRepository,
    private readonly messageGroupRepo: MessageGroupRepo,
    private readonly urlResultsRepository: UrlResultsRepository,
    private readonly ncpResultsRepository: NcpResultsRepository,
    private readonly urlInfosRepository: UrlInfosRepository,
    private readonly messagesContentRepository: MessagesContentRepository,
    @InjectEntityManager() private readonly entityManager: EntityManager,
  ) {}

  // 기본메세지 ncp 결과
  async ncpResult(messageId: number, email: string): Promise<any> {
    const message = await this.messagesRepository.findOneByMessageId(messageId);
    const user = await this.usersRepository.findOneByEmail(email);

    if (!message || !user) {
      throw new BadRequestException('messageId or email is wrong');
    }

    if (message.sentType === MessageType.N) {
      return { success: 0, reserved: message.receiverList.length, fail: 0 };
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
      console.log(message.requestId);
      console.log('ncp error', e.response.data);
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

    for (const idString of message.idString) {
      try {
        const response = await axios.get(
          `https://api-v2.short.io/statistics/link/${idString}`,
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

        statisticsArray.push({ totalClicks, humanClicks, idString });
      } catch (error) {
        console.log(error);
        throw new InternalServerErrorException();
      }
    }
    return statisticsArray;
  }

  // 단축 url A/B 비교 결과
  async shortUrlAbTestResult(messageId: number) {
    const message = await this.messagesRepository.findOneByMessageId(messageId);
    if (!message) {
      throw new BadRequestException('messageId is wrong');
    }

    const statisticsArray = [];

    try {
      const response = await axios.get(
        `https://api-v2.short.io/statistics/link/${message.urlForResult}`,
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

      statisticsArray.push({ totalClicks, humanClicks });
    } catch (error) {
      console.log(error);
      throw new error();
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

  async allMessageGroupResult(email: any) {
    const user = await this.usersRepository.findOneByEmail(email);
    if (!user) {
      throw new BadRequestException('email is wrong');
    }

    const messageGroups = await this.messageGroupRepo.findAllByUserId(
      user.userId,
    );
    if (!messageGroups) {
      throw new BadRequestException('email is wrong');
    }

    const results = await Promise.all(
      messageGroups.map(async (messageGroup) => {
        return this.messageGroupResult(messageGroup.id, email);
      }),
    );
    return results;
  }

  async messageGroupResult(messageGroupId: number, email: string) {
    const result =
      this.messageGroupRepo.findOneByMessageGroupId(messageGroupId);
    if (!result) {
      throw new BadRequestException('messageGroupId is wrong');
    }

    const user = await this.usersRepository.findOneByEmail(email);
    if (!user) {
      throw new BadRequestException('email is wrong');
    }

    const messages = await this.messagesRepository.findAllByMessageGroupId(
      messageGroupId,
    );
    if (!messages) {
      throw new BadRequestException('messageGroupId is wrong');
    }
    console.log(messageGroupId);

    const results = await Promise.all(
      messages.map(async (message) => {
        const [content, results] = await Promise.all([
          this.messagesContentRepository.findOneByMessageId(message.messageId),
          this.messageResult(message.messageId),
        ]);
        return {
          message: message,
          content: content,
          results: results,
        };
      }),
    );
    return results;
  }
  // 메세지별 결과 (polling 결과 + 클릭했을 때의 결과를 같이 반환)
  async messageResult(messageId: number) {
    console.log(messageId);
    // 클릭했을 때 결과를 하나 만듦
    const message = await this.messagesRepository.findOneByMessageId(messageId);
    const user = await this.usersRepository.findOneByUserId(message.userId);
    console.log('!!!!');
    const newNcpResult = await this.ncpResult(messageId, user.email);
    console.log('!!!!2');

    const resultEntity = this.entityManager.create(NcpResult, {
      message: message,
      success: newNcpResult.success,
      reserved: newNcpResult.reserved,
      fail: newNcpResult.fail,
      createdAt: new Date(),
      user: user,
    });

    const resultId = (await this.entityManager.save(resultEntity)).ncpResultId;

    const newUrlResult = await this.shortUrlResult(messageId);

    for (const result of newUrlResult) {
      const resultEntity2 = this.entityManager.create(UrlResult, {
        message: message,
        user: user,
        humanclicks: result.humanClicks,
        totalclicks: result.totalClicks,
        idString: result.idString,
        ncpResultId: resultId,
      });

      await this.entityManager.save(resultEntity2);
    }

    // polling 결과들
    const ncpMessage = await this.ncpResultsRepository.findAllByMessageId(
      messageId,
    );
    if (!ncpMessage) {
      throw new BadRequestException('messageId is wrong');
    }

    const messageResults = [];

    for (const ncp of ncpMessage) {
      const urlMessage = await this.urlResultsRepository.findAllByResultId(
        ncp.ncpResultId,
      );

      const result = {
        message: messageId,
        user: ncp.userId,
        urls: [],
        success: ncp.success,
        reserved: ncp.reserved,
        fail: ncp.fail,
        createdAt: ncp.createdAt,
      };
      for (const url of urlMessage) {
        if (ncp.messageId === url.messageId) {
          const urlInfo = await this.urlInfosRepository.findOneByIdString(
            url.idString,
          );

          result.urls.push({
            shortUrl: urlInfo.shortenUrl,
            originalUrl: urlInfo.originalUrl,
            idString: url.idString,
            humanclicks: url.humanclicks,
            totalclicks: url.totalclicks,
          });
        }
      }

      messageResults.push(result);
    }
    return messageResults;
  }

  // ncp와 단축 url 결과를 합친 polling
  @Cron('0 */1 * * *')
  async handleNcpCron() {
    this.logger.log('ncp polling');
    const ncpmessages = await this.messagesRepository.findThreeDaysBeforeSend();

    for (const message of ncpmessages) {
      const user = await this.usersRepository.findOneByUserId(message.userId);

      try {
        const ncpResult = await this.ncpResult(message.messageId, user.email);

        const resultEntity = this.entityManager.create(NcpResult, {
          message: message,
          success: ncpResult.success,
          reserved: ncpResult.reserved,
          fail: ncpResult.fail,
          createdAt: new Date(),
          user: user,
        });

        const resultId = (await this.entityManager.save(resultEntity))
          .ncpResultId;

        console.log(`NCP results for message ${message.messageId} saved.`);

        if (message.createdAt > new Date(Date.now() - 24 * 60 * 60 * 1000)) {
          try {
            const shortUrlResult = await this.shortUrlResult(message.messageId);

            for (const result of shortUrlResult) {
              const resultEntity = this.entityManager.create(UrlResult, {
                message: message,
                user: user,
                humanclicks: result.humanClicks,
                totalclicks: result.totalClicks,
                idString: result.idString,
                ncpResultId: resultId,
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
      } catch (error) {
        console.error(
          `Failed to fetch NCP results for message ${message.messageId}.`,
          error,
        );
      }
    }
  }

  // A/B 테스트 결과 polling
  @Cron('*/5 * * * *')
  async handleAbTestCron() {
    this.logger.log('abtest polling');
    const messages = await this.messagesRepository.findNotSend();
    this.logger.log(messages);

    for (const message of messages) {
      try {
        const aMessageId = message.messageId - 2;
        const bMessageId = message.messageId - 1;

        const aShortUrlResult = await this.shortUrlAbTestResult(aMessageId);
        const bShortUrlResult = await this.shortUrlAbTestResult(bMessageId);

        const aHumanClick = aShortUrlResult[0].humanClicks;
        const bHumanClick = bShortUrlResult[0].humanClicks;

        if (aHumanClick >= bHumanClick) {
          await this.sendAbTestWinnerMessage(aMessageId);
          // const result = aMessageId;
          // return result;
        } else {
          // const result = bMessageId;
          // return result;
        }
      } catch (error) {
        console.error(
          `Failed to fetch ab test results for message ${message.messageId}.`,
          error,
        );
      }
    }
  }

  async sendAbTestWinnerMessage(messageId: number) {
    const messageContent =
      await this.messagesContentRepository.findOneByMessageId(messageId);

    const message = await this.messagesRepository.findOneByMessageId(messageId);

    const user = await this.usersRepository.findOneByUserId(message.userId);
  }
}
