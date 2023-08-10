import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Message } from '../message.entity';
import * as crypto from 'crypto';
import axios from 'axios';
import { ncpConfig } from '../../../config/ncp.config'; // 없애야 할 부분

@Injectable()
export class MessagesService {
  constructor(@InjectRepository(Message) private repo: Repository<Message>) {}

  // 유저 정보 확인하기 -> 수정 필요...!! repository 분리해야함
  //   async checkUserInfo(email: string) {
  //     const user = await this.usersService.checkUserInfoWithToken(email);
  //   }

  //  기본메세지 보내기
  async defaultMessage(defaultMessageDto) {
    const body = {
      type: 'MMS',
      contentType: await this.getCotentType,
      countryCode: '82',
      from: '01036289823',
      subject: defaultMessageDto.title,
      content: defaultMessageDto.content,
      messages: await this.createMessages(defaultMessageDto.receiver),
      reservetime: defaultMessageDto.reservetime || Date.now().toString(),
      reserveTimeZone: 'Asia/Seoul',
    };

    const headers = {
      'Content-Type': 'application/json; charset=utf-8',
      'x-ncp-iam-access-key': ncpConfig.accessKey,
      'x-ncp-apigw-timestamp': Date.now().toString(),
      'x-ncp-apigw-signature-v2': await this.signature(),
    };

    axios
      .post(
        `https://sens.apigw.ntruss.com/sms/v2/services/${ncpConfig.serviceId}/messages`,
        body,
        { headers },
      )
      .catch(async (e) => {
        // 에러일 경우 반환값
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

  async signature() {
    const message = [];
    const hmac = crypto.createHmac('sha256', ncpConfig.secretKey); //user의 db에서 빼오도록 수정 필요
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
    message.push(ncpConfig.accessKey); //user의 db에서 빼오도록 수정 필요

    const signiture = hmac.update(message.join('')).digest('base64');
    return signiture.toString();
  }

  //   async getMessageType(defaultMessageDto): Promise<string> {
  //     if (defaultMessageDto.content.length > 80) {
  //       return 'MMS';
  //     } else {
  //       return 'SMS';
  //     }
  //   }
}
