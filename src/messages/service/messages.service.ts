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

    const receiverPhones = defaultMessageDto.receiverList.map(
      (info) => info.phone,
    );

    const totalMoney = user.money + user.point;

    if (totalMoney < receiverPhones.length * 3) {
      const requiredPoints = receiverPhones.length * 3 - totalMoney;
      throw new HttpException(
        `need more points: ${requiredPoints}`,
        HttpStatus.FORBIDDEN,
      );
    }

    const shortenedUrls: string[] = [];
    const idStrings = [];

    for (const url of defaultMessageDto.urlList) {
      const response = await this.ShortenUrl(url);
      console.log(response.idString);
      shortenedUrls.push(response.shortURL);
      idStrings.push(response.idString);
    }

    const newContent = await this.replaceUrlContent(
      defaultMessageDto.urlList,
      shortenedUrls,
      defaultMessageDto.content,
    );

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
      messages: defaultMessageDto.receiverList.map((info) => ({
        to: info.phone,
        content: `${contentPrefix} ${this.createMessage(
          newContent,
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

    let headers;
    try {
      const now = Date.now().toString();
      headers = {
        'Content-Type': 'application/json; charset=utf-8',
        'x-ncp-iam-access-key': user.accessKey,
        'x-ncp-apigw-timestamp': now,
        'x-ncp-apigw-signature-v2': await this.signature(user, now),
      };
      const response = await axios.post(
        `https://sens.apigw.ntruss.com/sms/v2/services/${user.serviceId}/messages`,
        body,
        {
          headers,
        },
      );

      // 유저 금액 차감
      const deductionMoney = receiverPhones.length * 3;
      if (user.point >= deductionMoney) {
        user.point -= deductionMoney;
      } else {
        user.money -= deductionMoney - user.point;
        user.point = 0;
      }

      const message = new Message();
      message.isSent = true;
      message.sentType = MessageType.D;
      message.user = user;
      message.receiverList = receiverPhones;
      message.shortUrl = idStrings;
      message.requestId = response.data.requestId;

      await this.entityManager.transaction(
        async (transactionalEntityManager) => {
          await transactionalEntityManager.save(user);
          await transactionalEntityManager.save(message);
        },
      );

      return message.messageId;
    } catch (error) {
      throw new InternalServerErrorException();
    }
  }

  // 단축 URL 생성
  async ShortenUrl(url: string) {
    return got<{
      shortURL: string;
      idString: string;
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
        return response.body;
      })
      .catch((e) => {
        console.log(e.response.body);
        throw new InternalServerErrorException();
      });
  }

  async signature(user, timestamp) {
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
