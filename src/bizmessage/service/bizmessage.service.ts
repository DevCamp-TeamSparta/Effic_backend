import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { EntityManager } from 'typeorm';
import { InjectEntityManager } from '@nestjs/typeorm';
import { BizmessageRepository } from '../bizmessage.repository';
import { ShorturlService } from '../../shorturl/service/shorturl.service';
import { UsersService } from '../../users/service/users.service';
import {
  NCP_contentPrefix,
  NCP_contentSuffix,
} from '../../../commons/constants';
import axios from 'axios';
import * as crypto from 'crypto';
import { UserNcpInfo } from 'src/users/user.entity';

@Injectable()
export class BizmessageService {
  constructor(
    private readonly bizmessageRepository: BizmessageRepository,
    private readonly shorturlService: ShorturlService,
    private readonly usersService: UsersService,
    @InjectEntityManager() private readonly entityManager: EntityManager,
  ) {}

  // NCP에 이미지 업로드
  async uploadImage(userId, imageFile, imageUploadDto) {
    const UserNcpInfo = await this.usersService.findUserNcpInfoByUserId(userId);

    let headers;
    try {
      const now = Date.now().toString();
      headers = {
        'Content-Type':
          'multipart/form-data; boundary=a29b1180-70f5-42f7-afbe-0d68a15f2370',
        'x-ncp-apigw-timestamp': now,
        'x-ncp-iam-access-key': UserNcpInfo.accessKey,
        'x-ncp-apigw-signature-v2': await this.makeImageSignature(
          UserNcpInfo,
          now,
        ),
      };

      //   const booleanIsWide = imageUploadDto.isWide ? 'true' : 'false';

      let booleanIsWide;
      if (imageUploadDto.isWide === 'true') {
        booleanIsWide = 'true';
      } else {
        booleanIsWide = 'false';
      }
      console.log(imageUploadDto.isWide);
      console.log(booleanIsWide);

      const form = new FormData();
      form.append(
        'imageFile',
        new Blob([imageFile.buffer], {
          type: imageFile.mimetype,
        }),
        imageFile.originalname,
      );
      form.append('plusFriendId', imageUploadDto.plusFriendId);
      form.append('isWide', booleanIsWide);
      const response = await axios.post(
        `https://sens.apigw.ntruss.com/friendtalk/v2/services/${UserNcpInfo.bizServiceId}/images`,
        form,
        { headers },
      );
      return response.data;
    } catch (error) {
      if (error.response) {
        throw new HttpException(error.response.data, error.response.status);
      }
      throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async makeImageSignature(userNcpInfo, timestamp) {
    const message = [];
    const hmac = crypto.createHmac('sha256', userNcpInfo.secretKey);
    const space = ' ';
    const newLine = '\n';
    const method = 'POST';
    message.push(method);
    message.push(space);
    message.push(`/friendtalk/v2/services/${userNcpInfo.bizServiceId}/images`);
    message.push(newLine);
    message.push(timestamp);
    message.push(newLine);
    message.push(userNcpInfo.accessKey);

    const signature = hmac.update(message.join('')).digest('base64');
    return signature.toString();
  }

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
      const body = await this.makeBody(
        userId,
        defaultBizmessageDto.bizMessageInfoList,
        defaultBizmessageDto,
        receiverListForSend,
      );
      takeBody = body;
      requestIdList.push();
    }

    return { requestIdList }; // 수정되어야할 부분
  }

  async makeBody(userId, bizMessageInfoList, messageDto, receiverList) {
    const shortenedUrls = [];
    const idStrings = [];

    const userNcpInfo = await this.usersService.findUserNcpInfoByUserId(userId);

    for (const url of bizMessageInfoList.urlList) {
      const response = await this.shorturlService.createShorturl(url);
      shortenedUrls.push(response.shortURL);
      idStrings.push(response.idString);
    }

    const isAd = bizMessageInfoList.isAd;

    let contentPrefix = '';
    let contentSuffix = '';

    if (isAd) {
      contentPrefix = NCP_contentPrefix;
      contentSuffix = `${NCP_contentSuffix} ${userNcpInfo.advertiseNumber}`;
    }

    const newContent = await this.replaceUrlContent(
      bizMessageInfoList.urlList,
      shortenedUrls,
      bizMessageInfoList.content,
    );

    const body = {
      plusFriendId: messageDto.plusFriendId,
      messages: receiverList.map((info) => ({
        idAd: isAd,
        to: info.phone,
        content: `${contentPrefix} ${this.createMessageWithVariable(
          newContent,
          info,
        )} ${contentSuffix}`,
        ...(messageDto.buttonList ? { buttons: messageDto.buttonList } : {}),
        // image: {
        //   imageId: ,
        //   imageLink: ,
        // },
      })),
      ...(messageDto.reservetime
        ? {
            reserveTime: messageDto.reservetime,
            reserveTimeZone: 'Asia/Seoul',
          }
        : {}),
    };

    let headers;
    try {
      const now = Date.now().toString();
      headers = {
        'Content-Type': 'application/json; charset=utf-8',
        'x-ncp-apigw-timestamp': now,
        'x-ncp-iam-access-key': userNcpInfo.accessKey,
        'x-ncp-apigw-signature-v2': await this.makeSignature(UserNcpInfo, now),
      };
      const response = await axios.post(
        `https://sens.apigw.ntruss.com/friendtalk/v2/services/${userNcpInfo.bizServiceId}/messages`,
        body,
        { headers },
      );
      return { body, response, idStrings, shortenedUrls };
    } catch (error) {
      throw new HttpException(error.response.data, error.response.status);
    }
  }

  // 변수명 변경적용
  createMessageWithVariable(content: string, info: { [key: string]: string }) {
    Object.keys(info).forEach((key) => {
      const regex = new RegExp(`#{${key}}`, 'g');
      content = content.replace(regex, info[key]);
    });
    return content;
  }

  // url 변경적용
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

  async makeSignature(userNcpInfo, timestamp) {
    const message = [];
    const hmac = crypto.createHmac('sha256', userNcpInfo.secretKey);
    const space = ' ';
    const newLine = '\n';
    const method = 'POST';
    message.push(method);
    message.push(space);
    message.push(`friendtalk/v2/services/${userNcpInfo.bizServiceId}/messages`);
    message.push(newLine);
    message.push(timestamp);
    message.push(newLine);
    message.push(userNcpInfo.accessKey);

    const signature = hmac.update(message.join('')).digest('base64');
    return signature.toString();
  }
}
