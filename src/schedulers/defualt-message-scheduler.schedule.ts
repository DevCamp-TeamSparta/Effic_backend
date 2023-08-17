import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { EntityManager } from 'typeorm';
import { Cron, CronExpression } from '@nestjs/schedule';
import { InjectEntityManager } from '@nestjs/typeorm';
import { UsersRepository } from 'src/users/users.repository';
import { MessagesRepository } from 'src/messages/messages.repository';
import axios from 'axios';
import * as crypto from 'crypto';
import { shortIoConfig } from 'config/short-io.config';
import { DefaultResultDto } from 'src/messages/dto/default-result.dto';

@Injectable()
export class DefaultSchedulerService {
  create: any;
  constructor(
    private messagesRepository: MessagesRepository,
    private readonly usersRepository: UsersRepository,
    @InjectEntityManager() private readonly entityManager: EntityManager,
  ) {}

  @Cron(CronExpression.EVERY_10_MINUTES) // 24시간만 실행. createdAt이 24시간 이전인 메시지만 실행
  async handleUrlCron() {
    const messages =
      await this.messagesRepository.findOlderThanTwentyFourHours();

    for (const message of messages) {
      const result = await this.shortUrlResult(message.messageId);
      await this.saveUrlResult(result);
    }
  }

  // 단축 url 결과
  async shortUrlResult(messageId: number) {
    const message = await this.messagesRepository.findOneByMessageId(messageId);

    try {
      const response = await axios.get(
        `https://api-v2.short.io/statistics/link/${message.shortUrl}`,
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

      return { totalClicks, humanClicks };
    } catch (error) {
      console.log(error);
      throw new InternalServerErrorException();
    }
  }

  async saveUrlResult(defaultResultDto: DefaultResultDto) {
    const { totalClicks, humanClicks } = defaultResultDto;
    const newResult = this.create({
      totalClicks: totalClicks,
      humanClicks: humanClicks,
    });
    await this.messagesRepository.save(newResult);
  }

  @Cron('0 */1 * * *') // 시간별로 ncp 결과를 가져옴. createdAt이 72시간 이전인 메시지만 실행
  async handleNcpCron() {
    const messages = await this.messagesRepository.findOlderThanThreeDays();

    for (const message of messages) {
      // const result = await this.shortUrlResult(message.messageId);
      // await this.messagesRepository.saveUrlResult(result);
    }
  }

  // 기본메세지 ncp 결과
  async ncpResult(messageId: number, email: string) {
    const message = await this.messagesRepository.findOneByMessageId(messageId);
    const user = await this.usersRepository.findOneByEmail(email);

    const headers = {
      'x-ncp-apigw-timestamp': Date.now().toString(),
      'x-ncp-iam-access-key': user.accessKey,
      'x-ncp-apigw-signature-v2': await this.signature(user, message),
    };

    axios
      .get(
        `https://sens.apigw.ntruss.com/sms/v2/services/${user.serviceId}/messages?requestId=${message.requestId}`,
        { headers },
      )
      .then((response) => {
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
      })
      .catch((e) => {
        console.log(e.response.data);
        throw new InternalServerErrorException();
      });
  }

  async signature(user, messages) {
    const message = [];
    const hmac = crypto.createHmac('sha256', user.secretKey);
    const space = ' ';
    const newLine = '\n';
    const method = 'GET';
    const timestamp = Date.now().toString();
    message.push(method);
    message.push(space);
    message.push(
      `/sms/v2/services/${user.serviceId}/messages?${messages.requestId}`,
    );
    message.push(newLine);
    message.push(timestamp);
    message.push(newLine);
    message.push(user.accessKey);

    const signature = hmac.update(message.join('')).digest('base64');
    return signature.toString();
  }
}
