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
import {
  UserNcpInfoRepository,
  UsersRepository,
} from 'src/users/users.repository';
import { NcpResult, UrlResult, UsedPayments } from '../result.entity';
import {
  UrlResultsRepository,
  NcpResultsRepository,
} from '../results.repository';
import { MessagesContentRepository } from 'src/messages/messages.repository';
import { MessagesService } from 'src/messages/service/messages.service';
import { EntityManager } from 'typeorm';
import axios from 'axios';
import * as crypto from 'crypto';
import { tlyConfig } from 'config/short-io.config';
import { Cron, CronExpression } from '@nestjs/schedule';
import { MessageType } from 'src/messages/message.enum';
import { MessageContent } from 'src/messages/message.entity';

@Injectable()
export class ResultsService {
  private logger = new Logger('ResultsService');
  constructor(
    private readonly usersRepository: UsersRepository,
    private readonly userNcpInfoRepository: UserNcpInfoRepository,
    private readonly messagesService: MessagesService,
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

    const userNcpInfo = await this.userNcpInfoRepository.findOneByUserId(
      user.userId,
    );

    if (!message || !user) {
      throw new BadRequestException('messageId or email is wrong');
    }

    if (message.sentType === MessageType.N) {
      return { success: 0, reserved: message.receiverList.length, fail: 0 };
    }

    let success = 0;
    let fail = 0;
    let reserved = 0;

    for (const requestId of message.requestIdList) {
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
        const response = await axios.get(
          `https://sens.apigw.ntruss.com/sms/v2/services/${userNcpInfo.serviceId}/messages?requestId=${requestId}`,
          { headers },
        );

        for (let i = 0; i < response.data.itemCount; i++) {
          if (response.data.messages[i].statusName === 'success') {
            success++;
          } else if (response.data.messages[i].statusName === 'fail') {
            fail++;
          } else if (response.data.messages[i].statusName === 'reserved') {
            reserved++;
          }
        }
      } catch (error) {
        console.error(error);
        throw new InternalServerErrorException();
      }
    }
    return { success, reserved, fail };
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
      statisticsArray.push({ ...(await this.getResult(idString)), idString });
    }
    return statisticsArray;
  }

  async getResult(idString: string) {
    try {
      const urlInfo = await this.urlInfosRepository.findOneByIdString(idString);
      if (!urlInfo) {
        throw new BadRequestException('idString is wrong');
      }
      const tlyResponse = await axios.get(
        'https://t.ly/api/v1/link/stats?short_url=' +
          urlInfo.tlyUrlInfo.shortenUrl,
        {
          headers: {
            Authorization: 'Bearer ' + tlyConfig.secretKey,
            'Content-Type': 'application/json',
            Accept: 'application/json',
          },
        },
      );
      const totalClicks = tlyResponse.data.clicks || 0;
      const humanClicks = tlyResponse.data.unique_clicks || 0;
      return { totalClicks, humanClicks };
    } catch (error) {
      console.error(error);
      throw new InternalServerErrorException();
    }
  }

  // 단축 url A/B 비교 결과
  async shortUrlAbTestResult(messageId: number) {
    const message = await this.messagesRepository.findOneByMessageId(messageId);
    if (!message) {
      throw new BadRequestException('messageId is wrong');
    }

    const statisticsArray = [];

    try {
      statisticsArray.push(await this.getResult(message.urlForResult));
    } catch (error) {
      console.log(error);
      throw error;
    }
    return statisticsArray;
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
      `/sms/v2/services/${userNcpInfo.serviceId}/messages?requestId=${requestId}`,
    );
    message.push(newLine);
    message.push(timestamp);
    message.push(newLine);
    message.push(userNcpInfo.accessKey);

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

  // 사용 내역 조회
  async paymentResult(email: string) {
    const user = await this.usersRepository.findOneByEmail(email);
    if (!user) {
      throw new BadRequestException('email is wrong');
    }

    const payments = await this.entityManager.find(UsedPayments, {
      where: { userId: user.userId },
    });

    let condition = '';
    const paymentResults = [];

    for (const payment of payments) {
      const messageContent =
        await this.messagesContentRepository.findOneByMessageGroupId(
          payment.messageGroupId,
        );

      if (
        messageContent.sentType === MessageType.A ||
        messageContent.sentType === MessageType.B
      ) {
        condition = 'a/b test';
      } else {
        condition = 'default';
      }

      const result = {
        messageGroupId: payment.messageGroupId,
        title: messageContent.content.title,
        type: condition,
        finalPayment:
          payment.usedPoint + payment.usedMoney - payment.refundPayment,
        remainPoint: payment.remainPoint,
        remainMoney: payment.remainMoney,
        createdAt: payment.createdAt,
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

          const newMessage = await this.messagesRepository.findOneByMessageId(
            aMessageId + 2,
          );
          newMessage.isSent = true;
          newMessage.sentType = MessageType.A;
          newMessage.requestIdList = response.res;
          newMessage.idString = response.idStrings;
          newMessage.urlForResult = response.idStrings[index];
          await this.messagesRepository.save(newMessage);

          const usedMessageContent =
            await this.messagesContentRepository.findOneByMessageId(aMessageId);

          const newMessageContent = new MessageContent();
          newMessageContent.messageId = aMessageId + 2;
          newMessageContent.sentType = MessageType.A;
          newMessageContent.content = usedMessageContent.content;
          newMessageContent.hostnumber = usedMessageContent.hostnumber;
          newMessageContent.receiverList =
            usedMessageContent.remainReceiverList;

          await this.messagesContentRepository.save(newMessageContent);
        } else {
          const message = await this.messagesRepository.findOneByMessageId(
            bMessageId,
          );
          const index = message.idString.indexOf(message.urlForResult);

          const response = await this.sendAbTestWinnerMessage(bMessageId);

          const newMessage = await this.messagesRepository.findOneByMessageId(
            1 + bMessageId,
          );

          newMessage.isSent = true;
          newMessage.sentType = MessageType.B;
          newMessage.requestIdList = response.res;
          newMessage.idString = response.idStrings;
          newMessage.urlForResult = response.idStrings[index];
          await this.messagesRepository.save(newMessage);

          const usedMessageContent =
            await this.messagesContentRepository.findOneByMessageId(bMessageId);

          const newMessageContent = new MessageContent();
          newMessageContent.messageId = bMessageId + 1;
          newMessageContent.sentType = MessageType.B;
          newMessageContent.content = usedMessageContent.content;
          newMessageContent.hostnumber = usedMessageContent.hostnumber;
          newMessageContent.receiverList =
            usedMessageContent.remainReceiverList;

          await this.messagesContentRepository.save(newMessageContent);
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

    const requestIdList: string[] = [];
    const receiverList = messageContent.remainReceiverList;
    const receiverLength = receiverList.length;
    const receiverCount = Math.ceil(receiverLength / 1000);
    let takeBody;

    for (let i = 0; i < receiverCount; i++) {
      const receiverListForSend = receiverList.slice(i * 1000, (i + 1) * 1000);
      const body = await this.messagesService.makeBody(
        user,
        messageContent.content,
        messageContent,
        receiverListForSend,
      );
      takeBody = body;
      requestIdList.push(body.response.data.requestId);
      this.logger.log(body.response.data, body.idStrings, body.shortenedUrls);
    }
    return {
      res: requestIdList,
      idStrings: takeBody.idStrings,
      shortenedUrls: takeBody.shortenedUrls,
    };
  }

  // 문자발송이 끝난 건에 대해 실패한 전송 환불
  @Cron(CronExpression.EVERY_5_MINUTES, { name: 'refund' })
  async handleRefundCron() {
    this.logger.log('refund polling');

    const messages =
      await this.messagesRepository.findThreeDaysBeforeSendAndNotChecked();

    for (const message of messages) {
      try {
        const user = await this.usersRepository.findOneByUserId(message.userId);
        const ncpResult =
          await this.ncpResultsRepository.findLastOneByMessageId(
            message.messageId,
          );

        const usedPayment = await this.entityManager.findOne(UsedPayments, {
          where: { messageGroupId: message.messageGroupId },
        });

        const fail = ncpResult.fail;
        const refundAmount = fail * 3;

        if (usedPayment.usedPoint > 0) {
          user.point += refundAmount;
          message.isMoneyCheck = true;
          usedPayment.refundPayment += refundAmount;
          usedPayment.remainPoint += refundAmount;
        } else {
          user.money += refundAmount;
          message.isMoneyCheck = true;
          usedPayment.refundPayment += refundAmount;
          usedPayment.remainMoney += refundAmount;
        }

        this.entityManager.transaction(async (transactionalEntityManager) => {
          await transactionalEntityManager.save(user);
          await transactionalEntityManager.save(message);
          await transactionalEntityManager.save(usedPayment);
        });

        console.log(
          `Refund for message ${message.messageId} is completed. ${refundAmount} won is refunded.`,
        );
      } catch (error) {
        console.error(
          `Failed to refund for message ${message.messageId}. We will check it again.`,
          error,
        );
      }
    }
  }

  async tlyInfo(idString: string) {
    try {
      const tlyResponse = await axios.get(
        'https://t.ly/api/v1/link/stats?short_url=' + idString,
        {
          headers: {
            Authorization: 'Bearer ' + tlyConfig.secretKey,
            'Content-Type': 'application/json',
            Accept: 'application/json',
          },
        },
      );
      const totalClicks = tlyResponse.data.clicks || 0;
      const humanClicks = tlyResponse.data.unique_clicks || 0;
      return { totalClicks, humanClicks };
    } catch (error) {
      console.error(error);
      throw new InternalServerErrorException();
    }
  }
}
