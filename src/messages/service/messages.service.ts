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
import { ncpConfig } from 'config/ncp.config';

@Injectable()
export class MessagesService {
  constructor(
    private readonly usersRepository: UsersRepository,
    private readonly messagesRepository: MessagesRepository,
    @InjectEntityManager() private readonly entityManager: EntityManager,
  ) {}

  //  기본메세지 보내기
  async defaultMessage(email, defaultMessageDto) {
    // 유저정보 확인
    const user = await this.usersRepository.findOneByEmail(email);

    if (user.point < defaultMessageDto.url.length * 3) {
      const requiredPoints = defaultMessageDto.url.length * 3 - user.point;
      throw new HttpException(
        `need more points: ${requiredPoints}`,
        HttpStatus.FORBIDDEN,
      );
    }

    const shortenedUrls: string[] = await Promise.all(
      defaultMessageDto.url.map(async (url: string) => {
        return await this.ShortenUrl(url);
      }),
    );

    const isAdvertisement = defaultMessageDto.advertisementOpt;

    let contentPrefix = '';
    let contentSuffix = '';

    if (isAdvertisement) {
      contentPrefix = '(광고)';
      contentSuffix = '\n무료수신거부 08012341234';
    }

    const newContent = await this.replaceUrlsInContent(
      defaultMessageDto.content,
      defaultMessageDto.url,
      shortenedUrls,
    );

    const body = {
      type: 'MMS',
      contentType: await this.getCotentType,
      countryCode: '82',
      from: user.hostnumber[0],
      subject: defaultMessageDto.title,
      content: contentPrefix + newContent + contentSuffix,
      messages: await this.createMessages(defaultMessageDto.receiver),
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
      'x-ncp-apigw-signature-v2': await this.signature(),
    };

    axios
      .post(
        `https://sens.apigw.ntruss.com/sms/v2/services/${user.serviceId}/messages`,
        body,
        { headers },
      )
      .catch(async (e) => {
        console.log(e.response.data);
        throw new InternalServerErrorException();
      });
    return 'send!';
  }

  async getCotentType(defaultMessageDto): Promise<string> {
    if (defaultMessageDto.advertiseInfo === true) {
      return 'AD';
    } else {
      return 'COMM';
    }
  }

  async createMessages(receivers) {
    return Promise.all(
      receivers.map((receiver) => this.createMessageObject(receiver)),
    );
  }

  createMessageObject(receiver) {
    return { to: receiver };
  }

  // 단축 URL 생성
  async ShortenUrl(url: string) {
    return got<{
      shortURL: string;
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
        return response.body.shortURL;
      })
      .catch((error) => {
        console.log(url, error.response.body);
        throw error;
      });
  }

  async replaceUrlsInContent(
    content: string,
    urls: string[],
    shortenedUrls: string[],
  ) {
    if (urls) {
      console.log(content);
      urls.forEach((url, index) => {
        console.log('url: ', url);
        content = content.replaceAll(url, shortenedUrls[index]);
        console.log(content);
        console.log('=========> ~ shortenedUrls:', shortenedUrls);
      });
    }
    console.log('=========> ~ content:', content);
    return content;
  }

  async signature() {
    // const user = await this.usersRepository.findOneByEmail(email);
    const message = [];
    const hmac = crypto.createHmac('sha256', ncpConfig.secretKey);
    const space = ' ';
    const newLine = '\n';
    const method = 'POST';
    const timestamp = Date.now().toString();
    message.push(method);
    message.push(space);
    message.push(`/sms/v2/services/${ncpConfig.serviceId}/messages`);
    message.push(newLine);
    message.push(timestamp);
    message.push(newLine);
    message.push(ncpConfig.accessKey);

    const signiture = hmac.update(message.join('')).digest('base64');
    return signiture.toString();
  }

  //   async getMessageType(defaultMessageDto): Promise<string> {
  //     if (defaultMessageDto.content.length > 80) {
  //       return 'MMS';
  //     } else {
  //       return 'SMS';.
  //     }
  //   }
}
