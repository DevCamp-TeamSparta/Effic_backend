import { Injectable } from '@nestjs/common';
import { EntityManager } from 'typeorm';
import { InjectEntityManager } from '@nestjs/typeorm';
import { BizmessageRepository } from '../bizmessage.repository';
import { UsersService } from '../../users/service/users.service';
import axios from 'axios';
import * as crypto from 'crypto';

@Injectable()
export class BizmessageService {
  constructor(
    private readonly bizmessageRepository: BizmessageRepository,
    private readonly usersService: UsersService,
    @InjectEntityManager() private readonly entityManager: EntityManager,
  ) {}

  // 기본 친구톡 보내기
  async sendDefaultBizmessage(userId, defaultBizmessageDto) {
    // 유저금액 확인
    const receiverPhones = defaultBizmessageDto.receiverList.map(
      (receiver) => receiver.phone,
    );

    await this.usersService.assertCheckUserMoney(userId, receiverPhones.length);

    const requestIdList: string[] = [];
    const receiverList = defaultBizmessageDto.receiverList;
    const receiverLength = receiverList.length;
    const receiverCount = Math.ceil(receiverLength / 100);
    let takeBody;

    for (let i = 0; i < receiverCount; i++) {
      const receiverListForSend = receiverList.slice(i * 100, (i + 1) * 100);
      const body = await this.makeBody();
      takeBody = body;
      requestIdList.push();
    }

    return { requestIdList }; // 수정되어야할 부분
  }

  async makeBody() {}

  // 이미지 업로드
  //   async uploadImage(userId) {
  //     const UserNcpInfo = await this.usersService.findUserNcpInfoByUserId(userId);

  //     let headers;
  //     try {
  //       const now = Date.now().toString();
  //       headers = {
  //         'Content-Type':
  //           'multipart/form-data; boundary=a29b1180-70f5-42f7-afbe-0d68a15f2370',
  //         'x-ncp-apigw-timestamp': now,
  //         'x-ncp-iam-access-key': UserNcpInfo.accessKey,
  //         'x-ncp-apigw-signature-v2': await this.makeImageSignature(UserNcpInfo, now),
  //       };

  //       const response = await axios.post(
  //         `https://sens.apigw.ntruss.com/friendtalk/v2/services/${UserNcpInfo.bizServiceId}/images`,
  //         body,
  //         { headers },
  //       );
  //     } catch (error) {}
  //   }

  async makeImageSignature(userNcpInfo, timestamp) {
    const message = [];
    const hmac = crypto.createHmac('sha256', userNcpInfo.secretKey);
    const space = ' ';
    const newLine = '\n';
    const method = 'POST';
    message.push(method);
    message.push(space);
    message.push(`friendtalk/v2/services/${userNcpInfo.bizServiceId}/images`);
    message.push(newLine);
    message.push(timestamp);
    message.push(newLine);
    message.push(userNcpInfo.accessKey);

    const signature = hmac.update(message.join('')).digest('base64');
    return signature.toString();
  }
}
