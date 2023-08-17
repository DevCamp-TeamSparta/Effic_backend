import {
  Injectable,
  InternalServerErrorException,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { EntityManager } from 'typeorm';
import { InjectEntityManager } from '@nestjs/typeorm';
import { UsersRepository } from '../../users/users.repository';
import { MessagesRepository } from '../messages.repository';
import * as crypto from 'crypto';
import axios from 'axios';
import got from 'got';
import { shortIoConfig } from 'config/short-io.config';
import { Message } from '../message.entity';
import { MessageType } from '../message.enum';
import { create } from 'domain';

@Injectable()
export class MessagesService {
  constructor(
    private readonly usersRepository: UsersRepository,
    private readonly messagesRepository: MessagesRepository,
    @InjectEntityManager() private readonly entityManager: EntityManager,
  ) {}

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

  // 기본메세지 보내기
  async defaultMessage(email, defaultMessageDto) {
    // 유저정보 확인
    const user = await this.usersRepository.findOneByEmail(email);

    if (user.point < defaultMessageDto.receiver.length * 3) {
      const requiredPoints = defaultMessageDto.receiver.length * 3 - user.point;
      throw new HttpException(
        `need more points: ${requiredPoints}`,
        HttpStatus.FORBIDDEN,
      );
    }

    const isAdvertisement = defaultMessageDto.advertisementInfo;

    let contentPrefix = '';
    let contentSuffix = '';

    if (isAdvertisement) {
      contentPrefix = '(광고)';
      contentSuffix = '\n무료수신거부 08012341234';
    }

    const body = {
      type: 'MMS',
      contentType: await this.getCotentType(defaultMessageDto),
      countryCode: '82',
      from: defaultMessageDto.hostnumber,
      subject: defaultMessageDto.title,
      content: defaultMessageDto.content,
      messages: defaultMessageDto.receiver.map((info) => ({
        to: info.phone,
        content: `${contentPrefix} ${this.createMessage(
          defaultMessageDto.content,
          info,
        )} ${contentSuffix}`,
      })),
      ...(defaultMessageDto.reservetime
        ? {
            reservetime: defaultMessageDto.reservetime,
            reserveTimeZone: 'Asia/Seoul',
          }
        : {}),
    };

    const headers = {
      'Content-Type': 'application/json; charset=utf-8',
      'x-ncp-iam-access-key': user.accessKey,
      'x-ncp-apigw-timestamp': Date.now().toString(),
      'x-ncp-apigw-signature-v2': await this.signature(user),
    };

    axios
      .post(
        `https://sens.apigw.ntruss.com/sms/v2/services/${user.serviceId}/messages`,
        body,
        { headers },
      )
      .then(async (response) => {
        const message = new Message();
        message.isSent = true;
        message.sentType = MessageType.D;
        message.user = user;
        message.receiver = defaultMessageDto.receiver;
        // message.shortUrl = await this.ShortenUrl.body.idString;
        message.requestId = response.data.requestId;

        await this.entityManager.save(Message, message);
        return response.data.requestId;
      })
      .catch(async (e) => {
        console.log(e.response.data);
        throw new InternalServerErrorException();
      });
    return 'send!';
  }

  // 단축 URL 생성
  async ShortenUrl(url: string) {
    return got<{
      shortURL: string;
      idString: string[];
    }>({
      method: 'POST',
      url: 'https://api.short.io/links',
      headers: {
        authorization: shortIoConfig.secretKey,
      },
      json: {
        originalURL: url,
        domain: 'au9k.short.gy',
      },
      responseType: 'json',
    })
      .then((response) => {
        console.log(response.body);
        // idString = response.body.idString;
        return response.body.shortURL;
      })
      .catch((e) => {
        console.log(e.response.body);
        throw new InternalServerErrorException();
      });
  }

  // async saveShortenUrl(messageId, shortUrl: string[]) {
  //   const message = await this.messagesRepository.findOneByMessageId(messageId);
  //   await this.messagesRepository.saveShortenUrl(message.messageId, shortUrl);
  // }

  async signature(user) {
    const message = [];
    const hmac = crypto.createHmac('sha256', user.secretKey);
    const space = ' ';
    const newLine = '\n';
    const method = 'POST'; // 수정 필요
    const timestamp = Date.now().toString();
    message.push(method);
    message.push(space);
    message.push(
      `/sms/v2/services/${user.serviceId}/messages`, // 수정 필요.
    );
    message.push(newLine);
    message.push(timestamp);
    message.push(newLine);
    message.push(user.accessKey);

    const signature = hmac.update(message.join('')).digest('base64');
    return signature.toString();
  }

  // 기본메세지 ncp 결과
  async ncpResult(messageId: number, email: string) {
    const message = await this.messagesRepository.findOneByMessageId(messageId);
    const user = await this.usersRepository.findOneByEmail(email);

    const headers = {
      'x-ncp-apigw-timestamp': Date.now().toString(),
      'x-ncp-iam-access-key': user.accessKey,
      'x-ncp-apigw-signature-v2': await this.signature(user),
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
        console.log(success, reserved, fail);
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
      console.log(response.data);

      return { totalClicks, humanClicks };
    } catch (error) {
      console.log(error);
      throw new InternalServerErrorException();
    }
  }
}
