import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { EntityManager } from 'typeorm';
import { InjectEntityManager } from '@nestjs/typeorm';
import { BizmessageGroupRepository } from '../bizmessage.repository';
import { ShorturlService } from '../../shorturl/service/shorturl.service';
import { UsersService } from '../../users/service/users.service';
import {
  NCP_BizMessage_price,
  NCP_contentPrefix,
  NCP_contentSuffix,
} from '../../../commons/constants';
import axios from 'axios';
import * as crypto from 'crypto';
import { UsedPayments } from 'src/results/entity/result.entity';
import * as FormData from 'form-data';
import {
  Bizmessage,
  BizmessageAdReceiverList,
  BizmessageContent,
} from '../bizmessage.entity';
import { bizmessageType } from '../bizmessage.enum';

@Injectable()
export class BizmessageService {
  constructor(
    private readonly bizmessageGroupRepository: BizmessageGroupRepository,
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

      let booleanIsWide;
      if (imageUploadDto.isWide === 'true') {
        booleanIsWide = 'true';
      } else {
        booleanIsWide = 'false';
      }

      const form = new FormData();
      form.append('imageFile', imageFile.buffer, imageFile.originalname);
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

    await this.usersService.assertCheckUserMoney(
      userId,
      receiverPhones.length,
      NCP_BizMessage_price,
    );

    let shortButtonLink;
    let shortImageLink;
    if (defaultBizmessageDto.buttonInfo) {
      shortButtonLink = await this.shorturlService.createShorturl(
        defaultBizmessageDto.buttonInfo.buttonLink,
      );
    }
    if (defaultBizmessageDto.imageInfo) {
      shortImageLink = await this.shorturlService.createShorturl(
        defaultBizmessageDto.imageInfo.imageLink,
      );
    }
    if (
      defaultBizmessageDto.buttonInfo &&
      defaultBizmessageDto.imageInfo &&
      defaultBizmessageDto.buttonInfo.buttonLink ===
        defaultBizmessageDto.imageInfo.imageLink
    ) {
      shortImageLink = shortButtonLink;
    }

    const requestIdList: string[] = [];
    const receiverList = defaultBizmessageDto.receiverList;
    const receiverLength = receiverList.length;
    const receiverCount = Math.ceil(receiverLength / 100);
    let takeBody;
    const idStringList = [];

    for (let i = 0; i < receiverCount; i++) {
      const receiverListForSend = receiverList.slice(i * 100, (i + 1) * 100);
      const body = await this.makeBody(
        userId,
        defaultBizmessageDto.bizMessageInfoList,
        defaultBizmessageDto,
        receiverListForSend,
        shortButtonLink,
        shortImageLink,
      );
      takeBody = body;
      requestIdList.push(body.response.data.requestId);
    }
    idStringList.push(...takeBody.idStrings);

    if (shortImageLink === shortButtonLink) {
      idStringList.push(shortImageLink.idString);
    } else {
      idStringList.push(shortImageLink.idString);
      idStringList.push(shortButtonLink.idString);
    }

    const urlForResult = defaultBizmessageDto.urlForResult;
    let idStringForResult;
    if (defaultBizmessageDto.buttonInfo) {
      if (defaultBizmessageDto.buttonInfo.buttonLink === urlForResult) {
        idStringForResult = shortButtonLink.idString;
      }
    }
    if (defaultBizmessageDto.imageInfo) {
      if (defaultBizmessageDto.imageInfo.imageLink === urlForResult) {
        idStringForResult = shortImageLink.idString;
      }
    }
    if (defaultBizmessageDto.bizMessageInfoList.urlList) {
      for (const url of defaultBizmessageDto.bizMessageInfoList.urlList) {
        if (url === urlForResult) {
          idStringForResult =
            takeBody.idStrings[
              defaultBizmessageDto.bizMessageInfoList.urlList.indexOf(url)
            ];
        }
      }
    }

    if (!idStringForResult) {
      throw new HttpException(
        'urlForResult가 잘못되었습니다.',
        HttpStatus.BAD_REQUEST,
      );
    }

    const messageContents = JSON.stringify({
      ...defaultBizmessageDto.bizMessageInfoList,
      ...(defaultBizmessageDto.imageInfo
        ? { imageInfo: defaultBizmessageDto.imageInfo }
        : {}),
      ...(defaultBizmessageDto.buttonInfo
        ? { buttonInfo: defaultBizmessageDto.buttonInfo }
        : {}),
    });

    const messageContent = JSON.parse(messageContents);

    // db에 bizmessageinfo 저장
    const saveBizmessageInfo = await this.saveBizmessageInfo(
      bizmessageType.D,
      userId,
      idStringList,
      idStringForResult,
      requestIdList,
      receiverPhones,
      messageContent,
      defaultBizmessageDto.plusFriendId,
      defaultBizmessageDto.receiverList,
      [],
    );

    // 금액 차감
    await this.deductedUserMoney(
      userId,
      receiverPhones,
      saveBizmessageInfo.bizmessageGroupId,
    );

    // 피로도 관리
    if (defaultBizmessageDto.bizMessageInfoList.isAd === true) {
      await this.saveAdBizmessageRecieverList(
        defaultBizmessageDto.receiverList,
        userId,
        saveBizmessageInfo.bizmessageGroupId,
        new Date(),
      );
    }

    return {
      bizmessageId: saveBizmessageInfo.bizmessageId,
      bizmessageGroupId: saveBizmessageInfo.bizmessageGroupId,
    };
  }

  async makeBody(
    userId,
    bizMessageInfoList,
    messageDto,
    receiverList,
    buttonLink,
    imageLink,
  ) {
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

    const linktype = {};
    if (messageDto.buttonInfo) {
      if (messageDto.buttonInfo.type === 'WL') {
        linktype['linkMobile'] = buttonLink.shortURL;
        linktype['linkPc'] = buttonLink.shortURL;
      } else if (messageDto.buttonInfo.type === 'AL') {
        linktype['schemeIos'] = messageDto.buttonInfo.schemeIos;
        linktype['schemeAndroid'] = messageDto.buttonInfo.schemeAndroid;
      }
    }

    const body = {
      plusFriendId: messageDto.plusFriendId,
      messages: receiverList.map((info) => ({
        idAd: messageDto.bizMessageInfoList.isAd,
        to: info.phone,
        content: `${contentPrefix} ${this.createMessageWithVariable(
          newContent,
          info,
        )} ${contentSuffix}`,
        ...(messageDto.buttonInfo
          ? {
              buttons: [
                {
                  type: messageDto.buttonInfo.type,
                  name: messageDto.buttonInfo.name,
                  ...(linktype ? linktype : {}),
                },
              ],
            }
          : {}),
        ...(messageDto.imageInfo
          ? {
              image: {
                imageId: messageDto.imageInfo.imageId,
                imageLink: imageLink.shortURL,
              },
            }
          : {}),
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
        'x-ncp-apigw-signature-v2': await this.makeSignature(userNcpInfo, now),
      };
      const response = await axios.post(
        `https://sens.apigw.ntruss.com/friendtalk/v2/services/${userNcpInfo.bizServiceId}/messages`,
        body,
        { headers },
      );
      return { body, response, idStrings, shortenedUrls };
    } catch (error) {
      if (error.response) {
        throw new HttpException(error.response.data, error.response.status);
      }
      throw new HttpException(
        '[INTERNAL] ' + error.message,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  // content - 변수명 변경적용
  createMessageWithVariable(content: string, info: { [key: string]: string }) {
    Object.keys(info).forEach((key) => {
      const regex = new RegExp(`#{${key}}`, 'g');
      content = content.replace(regex, info[key]);
    });
    return content;
  }

  // content - url 변경적용
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
    message.push(
      `/friendtalk/v2/services/${userNcpInfo.bizServiceId}/messages`,
    );
    message.push(newLine);
    message.push(timestamp);
    message.push(newLine);
    message.push(userNcpInfo.accessKey);

    const signature = hmac.update(message.join('')).digest('base64');
    return signature.toString();
  }

  // 정보 저장
  async saveBizmessageInfo(
    bizmessageType,
    userId,
    idStringList,
    idStringForResult,
    ncpRequestIdList,
    receiverPhoneList,
    messageContent,
    plusFriendId,
    receiverList,
    remainReceiverList,
  ) {
    const group = await this.bizmessageGroupRepository.createBizmessageGroup(
      userId,
    );

    const bizmessage = new Bizmessage();
    bizmessage.isSent = true;
    bizmessage.sentTpye = bizmessageType;
    bizmessage.idStringList = idStringList;
    bizmessage.urlForResult = idStringForResult;
    bizmessage.ncpRequestIdList = ncpRequestIdList;
    bizmessage.receiverList = receiverPhoneList;
    bizmessage.userId = userId;
    bizmessage.bizmessageGroupId = group.bizmessageGroupId;
    await this.entityManager.save(bizmessage);

    const bizmessageContent = new BizmessageContent();
    bizmessageContent.bizmessage = bizmessage;
    bizmessageContent.sentType = bizmessageType;
    bizmessageContent.content = messageContent;
    bizmessageContent.plusFriendId = plusFriendId;
    bizmessageContent.receiverList = receiverList;
    bizmessageContent.remainReceiverList = remainReceiverList;
    bizmessageContent.bizmessageGroupId = group.bizmessageGroupId;

    await this.entityManager.save(bizmessageContent);

    return {
      bizmessageId: bizmessage.bizmessageId,
      bizmessageGroupId: group.bizmessageGroupId,
    };
  }

  // 유저금액 차감
  async deductedUserMoney(userId, receiverPhones, bizmessageGroupId) {
    const user = await this.usersService.findUserByUserId(userId);
    const payment = new UsedPayments();
    const deductionMoney = receiverPhones.length * NCP_BizMessage_price;
    if (user.point >= deductionMoney) {
      user.point -= deductionMoney;
      payment.usedPoint = deductionMoney;
    } else {
      user.money -= deductionMoney - user.point;
      user.point = 0;
      payment.usedPoint = deductionMoney;
      payment.usedMoney = deductionMoney - payment.usedPoint;
    }

    await this.entityManager.save(user);

    payment.userId = user.userId;
    payment.messageGroupId = bizmessageGroupId;
    payment.remainMoney = user.money;
    payment.remainPoint = user.point;

    await this.entityManager.save(payment);
  }

  // 피로도 관리
  async saveAdBizmessageRecieverList(
    receiverList,
    userId,
    bizmessageGroupId,
    now,
  ) {
    for (let i = 0; i < receiverList.length; i++) {
      const adReceiverList = new BizmessageAdReceiverList();
      adReceiverList.phone = receiverList[i].phone;
      adReceiverList.sentAt = now;
      adReceiverList.userId = userId;
      adReceiverList.bizmessageGroupId = bizmessageGroupId;
      await this.entityManager.save(adReceiverList);
    }
  }
}
