import {
  Injectable,
  InternalServerErrorException,
  BadRequestException,
} from '@nestjs/common';
import { InjectEntityManager } from '@nestjs/typeorm';
import { MessagesRepository } from 'src/messages/messages.repository';
import { UsersRepository } from 'src/users/users.repository';
import { EntityManager } from 'typeorm';
import axios from 'axios';
import * as crypto from 'crypto';
import { shortIoConfig } from 'config/short-io.config';

@Injectable()
export class ResultsService {
  constructor(
    private readonly usersRepository: UsersRepository,
    private readonly messagesRepository: MessagesRepository,
    @InjectEntityManager() private readonly entityManager: EntityManager,
  ) {}

  // 기본메세지 ncp 결과
  async ncpResult(messageId: number, email: string) {
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

  // 단축 url 결과
  async shortUrlResult(messageId: number) {
    const message = await this.messagesRepository.findOneByMessageId(messageId);
    if (!message) {
      throw new BadRequestException('messageId is wrong');
    }

    const shortUrlArray = [message.shortUrl.slice(1, -1)];
    console.log('=========> ~ shortUrlArray:', shortUrlArray);
    for (const shortUrl of shortUrlArray) {
      console.log('=========> ~ shortUrl:', shortUrl);
    }
    // const shortUrlObject = message.shortUrl;
    // for (const idString of Object.values(shortUrlObject)) {
    //   console.log('=========> ~ shortUrlObject:', shortUrlObject);
    //   console.log('=========> ~ idString:', idString);
    // }
    // console.log(result);

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
}
