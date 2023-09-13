import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { EntityManager } from 'typeorm';
import { InjectEntityManager } from '@nestjs/typeorm';
import { UsersRepository } from '../../users/users.repository';
import * as crypto from 'crypto';
import axios from 'axios';
import got from 'got';
import { shortIoConfig, tlyConfig } from 'config/short-io.config';
import { Message, TlyUrlInfo } from '../message.entity';
import { MessageType } from '../message.enum';
import { MessageContent } from '../message.entity';
import { UrlInfo } from '../message.entity';
import { MessageGroupRepo } from '../messages.repository';
import { UsedPayments } from 'src/results/result.entity';

@Injectable()
export class MessagesService {
  constructor(
    private readonly usersRepository: UsersRepository,
    private readonly messageGroupRepo: MessageGroupRepo,
    @InjectEntityManager() private readonly entityManager: EntityManager,
  ) {}

  async getGroupList(email: string) {
    const user = await this.usersRepository.findOneByEmail(email);
    const messageGroupList = await this.messageGroupRepo.findAllByUserId(
      user.userId,
    );
    return messageGroupList;
  }

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
  async sendDefaultMessage(email, defaultMessageDto) {
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

    const requestIdList: string[] = [];
    const receiverList = defaultMessageDto.receiverList;
    const receiverLength = receiverList.length;
    const receiverCount = Math.ceil(receiverLength / 1000);
    let takeBody;

    for (let i = 0; i < receiverCount; i++) {
      const receiverListForSend = receiverList.slice(i * 1000, (i + 1) * 1000);
      const body = await this.makeBody(
        user,
        defaultMessageDto,
        defaultMessageDto,
        receiverListForSend,
      );
      takeBody = body;
      requestIdList.push(body.response.data.requestId);
    }

    const saveMessageInfo = await this.saveMessageInfo(
      MessageType.D,
      user,
      receiverPhones,
      takeBody.idStrings,
      requestIdList,
      defaultMessageDto,
    );

    await this.deductedUserMoney(user, receiverPhones, saveMessageInfo);

    return {
      messageId: saveMessageInfo.messageId,
      messageGroupId: saveMessageInfo.messageGroupId,
    };
  }

  // 단축 URL 생성
  async makeShortenUrl(url: string) {
    // TODO: t.ly로 단축 & DB에 저장
    const token = tlyConfig.secretKey;
    const tlyResponse = await got<{
      short_url: string;
      long_url: string;
      short_id: string;
    }>({
      method: 'POST',
      url: 'https://t.ly/api/v1/link/shorten',
      headers: {
        Authorization: `Bearer ${token}`,
      },
      json: {
        long_url: url,
      },
      responseType: 'json',
    });

    return got<{
      shortURL: string;
      idString: string;
      originalURL: string;
    }>({
      method: 'POST',
      url: 'https://api.short.io/links',
      headers: {
        authorization: shortIoConfig.secretKey,
      },
      json: {
        originalURL: tlyResponse.body.short_url,
        domain: 'effi.kr',
        allowDuplicates: true,
      },
      responseType: 'json',
    })
      .then((response) => {
        const tlyUrlInfo = new TlyUrlInfo();
        tlyUrlInfo.originalUrl = tlyResponse.body.long_url;
        tlyUrlInfo.shortenUrl = tlyResponse.body.short_url;
        tlyUrlInfo.idString = tlyResponse.body.short_id;
        tlyUrlInfo.firstShortenId = response.body.idString;

        const urlInfo = new UrlInfo();
        urlInfo.originalUrl = tlyResponse.body.long_url;
        urlInfo.shortenUrl = response.body.shortURL;
        urlInfo.idString = response.body.idString;

        this.entityManager.transaction(async (transactionalEntityManager) => {
          await transactionalEntityManager.save(tlyUrlInfo);
          await transactionalEntityManager.save(urlInfo);
        });

        return response.body;
      })
      .catch((e) => {
        console.error('shorten fail', e.response.body);
        throw new HttpException(e.response.body, HttpStatus.BAD_REQUEST);
      });
  }

  async makeBody(user, messageInfoList, messageDto, receiverList) {
    const shortenedUrls = [];
    const idStrings = [];

    for (const url of messageInfoList.urlList) {
      const response = await this.makeShortenUrl(url);
      shortenedUrls.push(response.shortURL);
      idStrings.push(response.idString);
    }

    const newContent = await this.replaceUrlContent(
      messageInfoList.urlList,
      shortenedUrls,
      messageInfoList.content,
    );

    const isAdvertisement = messageDto.advertiseInfo;

    let contentPrefix = '';
    let contentSuffix = '';

    if (isAdvertisement) {
      contentPrefix = '(광고)';
      contentSuffix = `\n무료수신거부 ${user.advertiseNumber}`;
    }

    const body = {
      type: 'LMS',
      contentType: await this.getCotentType(messageDto),
      countryCode: '82',
      from: messageDto.hostnumber,
      subject: messageInfoList.title,
      content: messageInfoList.content,
      messages: receiverList.map((info) => ({
        to: info.phone,
        content: `${contentPrefix} ${this.createMessage(
          newContent,
          info,
        )} ${contentSuffix}`,
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
        'x-ncp-iam-access-key': user.accessKey,
        'x-ncp-apigw-timestamp': now,
        'x-ncp-apigw-signature-v2': await this.makeSignature(user, now),
      };
      const response = await axios.post(
        `https://sens.apigw.ntruss.com/sms/v2/services/${user.serviceId}/messages`,
        body,
        {
          headers,
        },
      );
      return { body, response, idStrings, shortenedUrls };
    } catch (error) {
      throw new HttpException(error.response.data, HttpStatus.BAD_REQUEST);
    }
  }

  async makeSignature(user, timestamp) {
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

  // 정보 저장
  async saveMessageInfo(
    messageType,
    user,
    receiverPhones,
    idStrings,
    requestIdList,
    messageInfoDto,
  ) {
    const message = new Message();
    message.isSent = true;
    message.sentType = messageType;
    message.user = user;
    message.receiverList = receiverPhones;
    message.idString = idStrings;
    message.urlForResult = null;
    message.requestIdList = requestIdList;

    await this.entityManager.save(message);

    const messageContent = new MessageContent();
    messageContent.messageId = message.messageId;
    messageContent.content = messageInfoDto;
    messageContent.receiverList = messageInfoDto.receiverList;
    messageContent.sentType = messageType;
    messageContent.hostnumber = messageInfoDto.hostnumber;

    const result: any = {};
    await this.entityManager.transaction(async (transactionalEntityManager) => {
      await transactionalEntityManager.save(user);
      const group = await this.messageGroupRepo.createMessageGroup(user.userId);
      message.messageGroupId = group.id;
      messageContent.messageGroupId = group.id;
      await transactionalEntityManager.save(message);
      await transactionalEntityManager.save(messageContent);
      result.id = group.id;
    });

    return {
      messageId: message.messageId,
      messageGroupId: result.id,
    };
  }

  async saveAbMessageInfo(
    MessageType,
    user,
    receiverPhones,
    idStrings,
    idStringForResult,
    messageGroupId,
    requestIdList,
    abMessageContent,
    abMessageReceiverList,
    abMessageRemain,
    abMessageHostnumber,
  ) {
    const message = new Message();
    message.isSent = true;
    message.sentType = MessageType;
    message.user = user;
    message.receiverList = receiverPhones;
    message.idString = idStrings;
    message.urlForResult = idStringForResult;
    message.messageGroupId = messageGroupId;
    message.requestIdList = requestIdList;
    await this.entityManager.save(message);

    const messageContent = new MessageContent();
    messageContent.messageId = message.messageId;
    messageContent.content = abMessageContent;
    messageContent.receiverList = abMessageReceiverList;
    messageContent.remainReceiverList = abMessageRemain;
    messageContent.sentType = MessageType;
    messageContent.hostnumber = abMessageHostnumber;
    messageContent.messageGroupId = messageGroupId;

    await this.entityManager.save(messageContent);

    return {
      messageId: message.messageId,
      messageGroupId: messageGroupId,
    };
  }

  // 유저금액 차감
  async deductedUserMoney(user, receiverPhones, saveMessageInfo) {
    const payment = new UsedPayments();
    const deductionMoney = receiverPhones.length * 3;
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
    payment.messageGroupId = saveMessageInfo.messageGroupId;
    payment.remainMoney = user.money;
    payment.remainPoint = user.point;

    await this.entityManager.save(payment);
  }

  // 테스트 메세지 보내기
  async sendTestMessage(email, testMessageDto) {
    // 유저정보 확인
    const user = await this.usersRepository.findOneByEmail(email);

    await this.makeBody(
      user,
      testMessageDto,
      testMessageDto,
      testMessageDto.receiverList,
    );

    return 'success';
  }

  // hostnumbercheck 메세지
  async checkHostNumberMessage(checkHostNumberDto) {
    const body = {
      type: 'LMS',
      contentType: await this.getCotentType(checkHostNumberDto),
      countryCode: '82',
      from: checkHostNumberDto.hostnumber,
      subject: '번호확인 문자',
      content: '번호확인 문자',
      messages: [
        {
          to: '01712341234',
          content: '번호확인 문자',
        },
      ],
    };

    let headers;
    try {
      const now = Date.now().toString();
      headers = {
        'Content-Type': 'application/json; charset=utf-8',
        'x-ncp-iam-access-key': checkHostNumberDto.accessKey,
        'x-ncp-apigw-timestamp': now,
        'x-ncp-apigw-signature-v2': await this.makeSignature(
          checkHostNumberDto,
          now,
        ),
      };
      await axios.post(
        `https://sens.apigw.ntruss.com/sms/v2/services/${checkHostNumberDto.serviceId}/messages`,
        body,
        {
          headers,
        },
      );

      return 'success';
    } catch (error) {
      throw new HttpException(error.response.data, HttpStatus.BAD_REQUEST);
    }
  }

  // AB테스트 메세지 보내기
  async sendAbTestMessage(email, abTestMessageDto) {
    // 유저정보 확인
    const user = await this.usersRepository.findOneByEmail(email);

    const receiverPhones = abTestMessageDto.receiverList.map(
      (info) => info.phone,
    );

    // 유저 금액 확인 (보낼 수 있는지)
    const totalMoney = user.money + user.point;

    if (totalMoney < receiverPhones.length * 3) {
      const requiredPoints = receiverPhones.length * 3 - totalMoney;
      throw new HttpException(
        `need more moneys: ${requiredPoints}`,
        HttpStatus.FORBIDDEN,
      );
    }

    // 리시버를 3개로 나누기
    let testReceiverNumber = 0;
    if (Math.ceil(receiverPhones.length / 2) % 2 == 1) {
      testReceiverNumber = Math.ceil(receiverPhones.length / 2) + 1;
    } else {
      testReceiverNumber = Math.ceil(receiverPhones.length / 2);
    }

    const aTestReceiver = abTestMessageDto.receiverList.slice(
      0,
      testReceiverNumber / 2,
    );
    const bTestReceiver = abTestMessageDto.receiverList.slice(
      testReceiverNumber / 2,
      testReceiverNumber,
    );

    const result = await this.messageGroupRepo.createMessageGroup(user.userId);
    // A, B 메세지 보내기
    for (let i = 0; i < 3; i++) {
      if (i < 1) {
        const requestIdList: string[] = [];
        const receiverList = aTestReceiver;
        const receiverLength = receiverList.length;
        const receiverCount = Math.ceil(receiverLength / 1000);
        let takeBody;

        for (let i = 0; i < receiverCount; i++) {
          const receiverListForSend = receiverList.slice(
            i * 1000,
            (i + 1) * 1000,
          );
          const body = await this.makeBody(
            user,
            abTestMessageDto.messageInfoList[0],
            abTestMessageDto,
            receiverListForSend,
          );
          takeBody = body;
          requestIdList.push(body.response.data.requestId);
        }

        const urlForResult = abTestMessageDto.urlForResult;
        const idStringIndex =
          abTestMessageDto.messageInfoList[0].urlList.indexOf(urlForResult);
        const idStringForResult = takeBody.idStrings[idStringIndex];

        await this.saveAbMessageInfo(
          MessageType.A,
          user,
          receiverPhones.slice(0, aTestReceiver.length),
          takeBody.idStrings,
          idStringForResult,
          result.id,
          requestIdList,
          abTestMessageDto.messageInfoList[0],
          abTestMessageDto.receiverList.slice(0, aTestReceiver.length),
          abTestMessageDto.receiverList.slice(testReceiverNumber),
          abTestMessageDto.hostnumber,
        );
      } else if (i < 2) {
        //B 메세지 보내기 + 저장
        const requestIdList: string[] = [];
        const receiverList = bTestReceiver;
        const receiverLength = receiverList.length;
        const receiverCount = Math.ceil(receiverLength / 1000);
        let takeBody;

        for (let i = 0; i < receiverCount; i++) {
          const receiverListForSend = receiverList.slice(
            i * 1000,
            (i + 1) * 1000,
          );
          const body = await this.makeBody(
            user,
            abTestMessageDto.messageInfoList[1],
            abTestMessageDto,
            receiverListForSend,
          );
          takeBody = body;
          requestIdList.push(body.response.data.requestId);
        }

        const urlForResult = abTestMessageDto.urlForResult;
        const idStringIndex =
          abTestMessageDto.messageInfoList[1].urlList.indexOf(urlForResult);
        const idStringForResult = takeBody.idStrings[idStringIndex];

        await this.saveAbMessageInfo(
          MessageType.B,
          user,
          receiverPhones.slice(aTestReceiver.length, testReceiverNumber),
          takeBody.idStrings,
          idStringForResult,
          result.id,
          requestIdList,
          abTestMessageDto.messageInfoList[1],
          abTestMessageDto.receiverList.slice(
            aTestReceiver.length,
            testReceiverNumber,
          ),
          abTestMessageDto.receiverList.slice(testReceiverNumber),
          abTestMessageDto.hostnumber,
        );
      } else {
        const message = new Message();
        message.isSent = false;
        message.sentType = MessageType.N;
        message.user = user;
        message.receiverList = receiverPhones.slice(testReceiverNumber);
        message.idString = null;
        message.urlForResult = null;
        message.messageGroupId = result.id;
        await this.entityManager.save(message);
      }
    }
    // 유저 금액 차감
    await this.deductedUserMoney(
      user,
      receiverPhones,
      await this.saveAbMessageInfo,
    );

    return {
      messageGroupId: result.id,
    };
  }
  catch(error) {
    console.log(error);
    throw new HttpException(error.response.data, HttpStatus.BAD_REQUEST);
  }
}
