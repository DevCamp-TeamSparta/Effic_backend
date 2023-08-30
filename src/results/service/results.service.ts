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
import { NcpResult, UrlResult, UsedPayments } from '../result.entity';
import { UrlResultsRepository } from '../results.repository';
import { NcpResultsRepository } from '../results.repository';
import { MessagesContentRepository } from 'src/messages/messages.repository';
import { EntityManager } from 'typeorm';
import axios from 'axios';
import * as crypto from 'crypto';
import got from 'got';
import { shortIoConfig } from 'config/short-io.config';
import { Cron, CronExpression } from '@nestjs/schedule';
import { MessageType } from 'src/messages/message.enum';
import { UrlInfo } from 'src/messages/message.entity';

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

    if (message.sentType === MessageType.N) {
      return [];
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
        console.log('??', message.messageId);
        const [content, results] = await Promise.all([
          this.messagesContentRepository.findOneByMessageId(message.messageId),
          this.messageResult(message.messageId),
        ]);
        console.log(content);
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
    // 클릭했을 때 결과를 하나 만듦
    const message = await this.messagesRepository.findOneByMessageId(messageId);
    const user = await this.usersRepository.findOneByUserId(message.userId);
    const newNcpResult = await this.ncpResult(messageId, user.email);

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

  // 결제 내역 조회
  async paymentResult(userId: number, email: string) {
    const user = await this.usersRepository.findOneByEmail(email);
    if (!user) {
      throw new BadRequestException('email is wrong');
    }

    const payments = await this.entityManager.find(UsedPayments, {
      where: { userId },
    });
    if (!payments) {
      throw new BadRequestException('userId is wrong');
    }

    const paymentResults = [];

    for (const payment of payments) {
      const message = await this.messagesRepository.findOneByMessageId(
        payment.messageId,
      );

      const messagecontent =
        await this.messagesContentRepository.findOneByMessageId(
          payment.messageId,
        );

      const result = {
        messageId: payment.messageId,
        payment: payment.usedPayment,
        createdAt: message.createdAt,
        groupId: message.messageGroupId,
        content: messagecontent.content,
        type: messagecontent.sentType,
      };

      paymentResults.push(result);
    }
    return paymentResults;
  }

  // ncp와 단축 url 결과를 합친 polling
  @Cron('0 */1 * * *', { name: 'result' })
  async handleResultCron() {
    this.logger.log('result polling');
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

        const payment = await this.entityManager.findOne(UsedPayments, {
          where: { messageId: message.messageId },
        });

        if (payment) {
          payment.alreadyUsed = payment.usedPayment;
          payment.usedPayment = ncpResult.success * 3;
          await this.entityManager.save(payment);
        } else {
          const paymentEntity = this.entityManager.create(UsedPayments, {
            message: message,
            user: user,
            usedPayment: ncpResult.success * 3,
            alreadyUsed: 0,
          });

          await this.entityManager.save(paymentEntity);
        }

        // 유저 금액 차감
        const deductionMoney = payment.usedPayment - payment.alreadyUsed;
        if (user.point >= deductionMoney) {
          user.point -= deductionMoney;
        } else {
          user.point = 0;
          user.money -= deductionMoney - user.point;
        }
        await this.entityManager.save(user);

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
  @Cron(CronExpression.EVERY_5_MINUTES, { name: 'abtest' })
  async handleAbTestInterval() {
    this.logger.log('abtest polling');
    const messages = await this.messagesRepository.findNotSend();

    for (const message of messages) {
      try {
        const aMessageId = message.messageId - 2;
        const bMessageId = message.messageId - 1;

        const aShortUrlResult = await this.shortUrlAbTestResult(aMessageId);
        const bShortUrlResult = await this.shortUrlAbTestResult(bMessageId);

        const aHumanClick = aShortUrlResult[0].humanClicks;
        const bHumanClick = bShortUrlResult[0].humanClicks;

        if (aHumanClick >= bHumanClick) {
          const message = await this.messagesRepository.findOneByMessageId(
            aMessageId,
          );
          const index = message.idString.indexOf(message.urlForResult);

          const response = await this.sendAbTestWinnerMessage(aMessageId);
          message.isSent = true;
          message.sentType = MessageType.A;
          message.createdAt = new Date();
          message.requestId = response.res;
          message.idString = response.idStrings;
          message.urlForResult = response.shortenedUrls[index];
          await this.messagesRepository.save(message);
        } else {
          const message = await this.messagesRepository.findOneByMessageId(
            bMessageId,
          );
          const index = message.idString.indexOf(message.urlForResult);

          const response = await this.sendAbTestWinnerMessage(bMessageId);
          message.isSent = true;
          message.sentType = MessageType.B;
          message.createdAt = new Date();
          message.requestId = response.res;
          message.idString = response.idStrings;
          message.urlForResult = response.shortenedUrls[index];
          await this.messagesRepository.save(message);
        }
      } catch (error) {
        console.error(
          `Failed to fetch ab test results for message ${message.messageId}.`,
          error,
        );
      }
    }
  }

  async getCotentType(defaultMessageDto): Promise<string> {
    if (defaultMessageDto.advertiseInfo === true) {
      return 'AD';
    } else {
      return 'COMM';
    }
  }

  createMessage(content: string, info: { [key: string]: string }) {
    Object.keys(info).forEach((key) => {
      const regex = new RegExp(`#{${key}}`, 'g');
      content = content.replace(regex, info[key]);
    });
    return content;
  }

  async sendAbTestWinnerMessage(messageId: number) {
    const messageContent =
      await this.messagesContentRepository.findOneByMessageId(messageId);

    const message = await this.messagesRepository.findOneByMessageId(messageId);

    const user = await this.usersRepository.findOneByUserId(message.userId);

    const shortenedUrls: string[] = [];
    const idStrings = [];

    for (const url of messageContent.content.urlList) {
      const response = await this.ShortenUrl(url);
      shortenedUrls.push(response.shortURL);
      idStrings.push(response.idString);
    }

    const newContent = await this.replaceUrlContent(
      messageContent.content.urlList,
      shortenedUrls,
      messageContent.content.content,
    );

    const isAdvertisement = messageContent.content.advertiseInfo;

    let contentPrefix = '';
    let contentSuffix = '';

    if (isAdvertisement) {
      contentPrefix = '(광고)';
      contentSuffix = `\n무료수신거부 ${user.advertiseNumber}`;
    }

    const body = {
      type: 'LMS',
      contentType: await this.getCotentType(messageContent.content),
      countryCode: '82',
      from: messageContent.hostnumber,
      subject: messageContent.content.title,
      content: messageContent.content.content,
      messages: messageContent.remainReceiverList.map((info) => ({
        to: info.phone,
        content: `${contentPrefix} ${this.createMessage(
          newContent,
          info,
        )} ${contentSuffix}`,
      })),
      ...(messageContent.content.reserveTime
        ? {
            reserveTime: messageContent.content.reserveTime,
            reserveTimeZone: 'Asia/Seoul',
          }
        : {}),
    };

    let headers;
    try {
      const now = Date.now().toString();
      headers = {
        'Content-Type': 'application/json; charset=utf-8',
        'x-ncp-iam-access-key': user.accessKey,
        'x-ncp-apigw-timestamp': now,
        'x-ncp-apigw-signature-v2': await this.makeSignature(user, now),
      };
      const response = await axios.post(
        `https://sens.apigw.ntruss.com/sms/v2/services/${user.serviceId}/messages`,
        body,
        {
          headers,
        },
      );
      this.logger.log(response.data, idStrings, shortenedUrls);
      return { res: response.data.requestId, idStrings, shortenedUrls };
    } catch (error) {
      console.log(error);
      throw new BadRequestException(error.response.data);
    }
  }

  async replaceUrlContent(
    urlList: string[],
    shortenedUrls: string[],
    content: string,
  ) {
    if (urlList) {
      urlList.forEach((url, index) => {
        content = content.replaceAll(url, shortenedUrls[index]);
      });
    }
    return content;
  }

  async ShortenUrl(url: string) {
    return got<{
      shortURL: string;
      idString: string;
      originalURL: string;
    }>({
      method: 'POST',
      url: 'https://api.short.io/links',
      headers: {
        authorization: shortIoConfig.secretKey,
      },
      json: {
        originalURL: url,
        domain: 'au9k.short.gy',
        allowDuplicates: true,
      },
      responseType: 'json',
    })
      .then((response) => {
        const urlInfo = new UrlInfo();
        urlInfo.originalUrl = response.body.originalURL;
        urlInfo.shortenUrl = response.body.shortURL;
        urlInfo.idString = response.body.idString;

        this.entityManager.save(urlInfo);

        return response.body;
      })
      .catch((e) => {
        console.error(e.response.body);
        throw new InternalServerErrorException();
      });
  }

  async makeSignature(user, timestamp) {
    const message = [];
    const hmac = crypto.createHmac('sha256', user.secretKey);
    const space = ' ';
    const newLine = '\n';
    const method = 'POST';
    message.push(method);
    message.push(space);
    message.push(`/sms/v2/services/${user.serviceId}/messages`);
    message.push(newLine);
    message.push(timestamp);
    message.push(newLine);
    message.push(user.accessKey);

    const signature = hmac.update(message.join('')).digest('base64');
    return signature.toString();
  }
}
