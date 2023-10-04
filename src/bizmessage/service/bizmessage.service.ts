import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { EntityManager } from 'typeorm';
import { InjectEntityManager } from '@nestjs/typeorm';
import {
  BizmessageContentRepository,
  BizmessageGroupRepository,
  BizmessageRepository,
} from '../bizmessage.repository';
import { ShorturlService } from '../../shorturl/service/shorturl.service';
import { UsersService } from '../../users/service/users.service';
import { NCP_BizMessage_price } from '../../../commons/constants';
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
    private readonly bizmessageRepository: BizmessageRepository,
    private readonly bizmessageGroupRepository: BizmessageGroupRepository,
    private readonly bizmessageContentRepository: BizmessageContentRepository,
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

  // 테스트 친구톡 보내기
  async sendTestBizmessage(userId, defaultBizmessageDto) {
    const user = await this.usersService.findUserByUserId(userId);

    const { shortButtonLinkList, shortImageLink } = await this.makeshortLinks(
      defaultBizmessageDto,
    );

    await this.makeBody(
      user.userId,
      defaultBizmessageDto.bizMessageInfoList,
      defaultBizmessageDto,
      defaultBizmessageDto.receiverList,
      shortButtonLinkList,
      shortImageLink,
    );

    return 'success';
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

    const { shortButtonLinkList, shortImageLink } = await this.makeshortLinks(
      defaultBizmessageDto,
    );

    const requestIdList: string[] = [];
    const receiverList = defaultBizmessageDto.receiverList;
    const receiverLength = receiverList.length;
    const receiverCount = Math.ceil(receiverLength / 100);
    let takeBody;
    const imageIdString = [];
    const contentIdStringList = [];
    const buttonIdStringList = [];

    for (let i = 0; i < receiverCount; i++) {
      const receiverListForSend = receiverList.slice(i * 100, (i + 1) * 100);
      const body = await this.makeBody(
        userId,
        defaultBizmessageDto.bizMessageInfoList,
        defaultBizmessageDto,
        receiverListForSend,
        shortButtonLinkList,
        shortImageLink,
      );
      takeBody = body;
      requestIdList.push(body.response.data.requestId);
    }
    contentIdStringList.push(...takeBody.idStrings);

    if (shortImageLink) {
      imageIdString.push(shortImageLink.idString);
    }
    if (shortButtonLinkList) {
      shortButtonLinkList.forEach((buttonLink) => {
        buttonIdStringList.push({
          mobile: buttonLink.shortbuttonMobile.idString,
          pc: buttonLink.shortbuttonPc.idString,
        });
      });
    }

    const messageContents = JSON.stringify({
      ...defaultBizmessageDto.bizMessageInfoList,
      ...(defaultBizmessageDto.imageInfo
        ? { imageInfo: defaultBizmessageDto.imageInfo }
        : {}),
      ...(defaultBizmessageDto.buttonInfoList
        ? { buttonInfoList: defaultBizmessageDto.buttonInfoList }
        : {}),
    });

    const messageContent = JSON.parse(messageContents);

    // db에 bizmessageinfo 저장
    const saveBizmessageInfo = await this.saveBizmessageInfo(
      bizmessageType.D,
      userId,
      buttonIdStringList,
      imageIdString,
      contentIdStringList,
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
    await this.saveAdBizmessageRecieverList(
      defaultBizmessageDto.receiverList,
      userId,
      saveBizmessageInfo.bizmessageGroupId,
      new Date(),
    );

    return {
      bizmessageId: saveBizmessageInfo.bizmessageId,
      bizmessageGroupId: saveBizmessageInfo.bizmessageGroupId,
    };
  }

  // ab 친구톡 보내기
  async sendAbTestBizmessage(userId, abTestBizmessageDto) {
    const receiverPhones = abTestBizmessageDto.receiverList.map(
      (info) => info.phone,
    );

    await this.usersService.assertCheckUserMoney(
      userId,
      receiverPhones.length,
      NCP_BizMessage_price,
    );

    let testReceiverAmount = 0;
    if (Math.ceil(receiverPhones.length / 2) % 2 == 1) {
      testReceiverAmount = Math.ceil(receiverPhones.length / 2) + 1;
    } else {
      testReceiverAmount = Math.ceil(receiverPhones.length / 2);
    }

    const aTestReceiverList = abTestBizmessageDto.receiverList.slice(
      0,
      testReceiverAmount / 2,
    );
    const aTestReceiverLength = aTestReceiverList.length;
    const aTestReceiverCount = Math.ceil(aTestReceiverLength / 100);

    const bTestReceiverList = abTestBizmessageDto.receiverList.slice(
      testReceiverAmount / 2,
      testReceiverAmount,
    );
    const bTestReceiverLength = bTestReceiverList.length;
    const bTestReceiverCount = Math.ceil(bTestReceiverLength / 100);

    let takeBody;
    const aTestRequestIdList = [];
    const aTestImageIdString = [];
    const aTestContentIdStringList = [];
    const aTestButtonIdStringList = [];
    const bTestRequestIdList = [];
    const bTestImageIdString = [];
    const bTestContentIdStringList = [];
    const bTestButtonIdStringList = [];

    // a 메세지보내기
    const {
      shortButtonLinkList: aTestShortButtonLinkList,
      shortImageLink: aTestShortImageLink,
    } = await this.makeshortLinks(
      abTestBizmessageDto.messageInfoList[0].bizMessageInfoList,
    );
    console.log(aTestShortButtonLinkList);
    console.log(aTestShortImageLink);

    for (let i = 0; i < aTestReceiverCount; i++) {
      const receiverListForSend = aTestReceiverList.slice(
        i * 100,
        (i + 1) * 100,
      );

      const body = await this.makeBody(
        userId,
        abTestBizmessageDto.messageInfoList[0].bizMessageInfoList,
        abTestBizmessageDto.messageInfoList[0],
        receiverListForSend,
        aTestShortButtonLinkList,
        aTestShortImageLink,
      );
      takeBody = body;
      aTestRequestIdList.push(takeBody.reponse.data.requestId);
    }
    aTestContentIdStringList.push(...takeBody.idStrings);

    if (aTestShortImageLink) {
      aTestImageIdString.push(aTestShortImageLink.idString);
    }

    if (aTestShortButtonLinkList) {
      aTestShortButtonLinkList.forEach((buttonLink) => {
        aTestButtonIdStringList.push({
          mobile: buttonLink.shortbuttonMobile.idString,
          pc: buttonLink.shortbuttonPc.idString,
        });
      });
    }

    await this.saveBizmessageInfo(
      bizmessageType.A,
      userId,
      aTestButtonIdStringList,
      aTestImageIdString,
      aTestContentIdStringList,
      aTestRequestIdList,
      receiverPhones.slice(0, aTestReceiverLength),
      abTestBizmessageDto.messageInfoList[0].bizMessageInfoList,
      abTestBizmessageDto.messageInfoList[0].plusFriendId,
      aTestReceiverList,
      abTestBizmessageDto.receiverList.slice(testReceiverAmount),
    );

    // b 메세지보내기
    // const {
    //   shortButtonLinkList: bTestShortButtonLinkList,
    //   shortImageLink: bTestShortImageLink,
    // } = await this.makeshortLinks(abTestBizmessageDto.messageInfoList[1]);

    // for (let i = 0; i < bTestReceiverCount; i++) {
    //   const receiverListForSend = bTestReceiverList.slice(
    //     i * 100,
    //     (i + 1) * 100,
    //   );

    //   const body = await this.makeBody(
    //     userId,
    //     abTestBizmessageDto.messageInfoList[1].bizMessageInfoList,
    //     abTestBizmessageDto.messageInfoList[1],
    //     receiverListForSend,
    //     bTestShortButtonLinkList,
    //     bTestShortImageLink,
    //   );
    //   takeBody = body;
    //   bTestRequestIdList.push(takeBody.reponse.data.requestId);
    // }
    // bTestContentIdStringList.push(...takeBody.idStrings);

    // if (bTestShortImageLink) {
    //   bTestImageIdString.push(bTestShortImageLink.idString);
    // }

    // if (bTestShortButtonLinkList) {
    //   bTestShortButtonLinkList.forEach((buttonLink) => {
    //     bTestButtonIdStringList.push({
    //       mobile: buttonLink.shortbuttonMobile.idString,
    //       pc: buttonLink.shortbuttonPc.idString,
    //     });
    //   });
    // }

    // const saveBizmessageInfo = await this.saveBizmessageInfo(
    //   bizmessageType.B,
    //   userId,
    //   bTestButtonIdStringList,
    //   bTestImageIdString,
    //   bTestContentIdStringList,
    //   bTestRequestIdList,
    //   receiverPhones.slice(aTestReceiverLength),
    //   abTestBizmessageDto.messageInfoList[1].bizMessageInfoList,
    //   abTestBizmessageDto.messageInfoList[1].plusFriendId,
    //   bTestReceiverList,
    //   abTestBizmessageDto.receiverList.slice(testReceiverAmount),
    // );

    // // 나머지
    // const bizmessage = new Bizmessage();
    // bizmessage.isSent = false;
    // bizmessage.sentTpye = bizmessageType.N;
    // bizmessage.userId = userId;
    // bizmessage.receiverList = receiverPhones.slice(testReceiverAmount);
    // bizmessage.bizmessageGroupId = saveBizmessageInfo.bizmessageGroupId;
    // await this.entityManager.save(bizmessage);

    // await this.deductedUserMoney(
    //   userId,
    //   receiverPhones,
    //   saveBizmessageInfo.bizmessageGroupId,
    // );

    // await this.saveAdBizmessageRecieverList(
    //   abTestBizmessageDto.receiverList,
    //   userId,
    //   saveBizmessageInfo.bizmessageGroupId,
    //   new Date(),
    // );

    // return {
    //   bizmessageGroupId: saveBizmessageInfo.bizmessageGroupId,
    // };
  }

  async makeshortLinks(messageDto) {
    let shortButtonLinkList;
    let shortImageLink;
    if (messageDto.buttonInfoList) {
      shortButtonLinkList = await Promise.all(
        messageDto.buttonInfoList.map(async (buttonInfo) => {
          const shortbuttonMobile = await this.shorturlService.createShorturl(
            buttonInfo.linkMobile,
          );
          const shortbuttonPc = await this.shorturlService.createShorturl(
            buttonInfo.linkPc,
          );
          return {
            shortbuttonMobile: shortbuttonMobile,
            shortbuttonPc: shortbuttonPc,
          };
        }),
      );
    }
    if (messageDto.imageInfo) {
      shortImageLink = await this.shorturlService.createShorturl(
        messageDto.imageInfo.imageLink,
      );
    }

    return { shortButtonLinkList, shortImageLink };
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

    const newContent = await this.replaceUrlContent(
      bizMessageInfoList.urlList,
      shortenedUrls,
      bizMessageInfoList.content,
    );

    const linktype = {};
    const buttons =
      messageDto.buttonInfoList?.map((buttonInfo) => {
        if (buttonInfo.type === 'WL') {
          linktype['linkMobile'] =
            buttonLink[
              messageDto.buttonInfoList.indexOf(buttonInfo)
            ].shortbuttonMobile.shortURL;
          linktype['linkPc'] =
            buttonLink[
              messageDto.buttonInfoList.indexOf(buttonInfo)
            ].shortbuttonPc.shortURL;
        } else if (buttonInfo.type === 'AL') {
          linktype['schemeIos'] = buttonInfo.schemeIos;
          linktype['schemeAndroid'] = buttonInfo.schemeAndroid;
        }

        return {
          type: buttonInfo.type,
          name: buttonInfo.name,
          ...(linktype ? linktype : {}),
        };
      }) || [];

    const body = {
      plusFriendId: messageDto.plusFriendId,
      messages: receiverList.map((info) => ({
        idAd: messageDto.bizMessageInfoList.isAd,
        to: info.phone,
        content: `${this.createMessageWithVariable(newContent, info)}`,
        buttons,
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
    buttonIdStringList,
    imageIdString,
    contentIdStringList,
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
    bizmessage.sentType = bizmessageType;
    bizmessage.buttonIdStringList = buttonIdStringList;
    bizmessage.imageIdString = imageIdString;
    bizmessage.contentIdStringList = contentIdStringList;
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
    payment.bizmessageGroupId = bizmessageGroupId;
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

  // bizmessage info 조회
  async findOneBizmessageInfoByBizmessageId(bizmessageId) {
    const bizmessage = await this.bizmessageRepository.findOneByBizmessageId(
      bizmessageId,
    );
    return bizmessage;
  }

  async findAllBizmessageByGroupId(bizmessageGroupId) {
    const bizmessages =
      await this.bizmessageRepository.findAllByBizmessageGroupId(
        bizmessageGroupId,
      );
    return bizmessages;
  }

  //bizmessageContent 조회
  async findOneBizmessageContentByBizmessageId(bizmessageId) {
    const bizmessageContent =
      await this.bizmessageContentRepository.findOneByBizmessageId(
        bizmessageId,
      );
    return bizmessageContent;
  }

  //bizmessageGroup 조회
  async findAllBizmessageGroupByUserId(userId) {
    const bizmessageGroups =
      await this.bizmessageGroupRepository.findAllBizmessageGroupByUserId(
        userId,
      );
    return bizmessageGroups;
  }

  // bizmessage 날짜별 조회
  async findThreeDaysBeforeSend() {
    const bizmessages =
      await this.bizmessageRepository.findThreeDaysBeforeSend();
    return bizmessages;
  }
}
