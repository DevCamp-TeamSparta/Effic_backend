import {
  Injectable,
  InternalServerErrorException,
  HttpException,
  HttpStatus,
  BadRequestException,
} from '@nestjs/common';
import { EntityManager } from 'typeorm';
import { InjectEntityManager } from '@nestjs/typeorm';
import { UsersRepository } from '../../users/users.repository';
import { ResultsService } from '../../results/service/results.service';
import * as crypto from 'crypto';
import axios from 'axios';
import got from 'got';
import { shortIoConfig } from 'config/short-io.config';
import { Message } from '../message.entity';
import { MessageType } from '../message.enum';
import { MessageContent } from '../message.entity';
import { UrlInfo } from '../message.entity';
import { MessageGroupRepo } from '../messages.repository';

@Injectable()
export class MessagesService {
  constructor(
    private readonly usersRepository: UsersRepository,
    private readonly messageGroupRepo: MessageGroupRepo,
    private readonly resultsService: ResultsService,
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
      type: 'LMS',
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
            reserveTime: defaultMessageDto.reservetime,
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
      message.idString = idStrings;
      message.urlForResult = null;
      message.requestId = response.data.requestId;

      const messageContent = new MessageContent();
      messageContent.messageId = message.messageId;
      messageContent.content = defaultMessageDto.content;
      messageContent.receiverList = defaultMessageDto.receiverList;
      messageContent.sentType = MessageType.D;
      messageContent.hostnumber = defaultMessageDto.hostnumber;

      const result: any = {};
      await this.entityManager.transaction(
        async (transactionalEntityManager) => {
          await transactionalEntityManager.save(user);
          const group = await this.messageGroupRepo.createMessageGroup(
            user.userId,
          );
          message.messageGroupId = group.id;
          await transactionalEntityManager.save(message);
          result.id = group.id;
          await transactionalEntityManager.save(messageContent);
        },
      );
      return {
        messageId: message.messageId,
        messageGroupId: result.id,
      };
    } catch (error) {
      console.log(error);
      throw new BadRequestException(error.response);
    }
  }

  // 단축 URL 생성
  async ShortenUrl(url: string) {
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
        originalURL: url,
        domain: 'au9k.short.gy',
        allowDuplicates: true,
      },
      responseType: 'json',
    })
      .then((response) => {
        const urlInfo = new UrlInfo();
        urlInfo.originalUrl = response.body.originalURL;
        urlInfo.shortenUrl = response.body.shortURL;
        urlInfo.idString = response.body.idString;

        this.entityManager.save(urlInfo);

        return response.body;
      })
      .catch((e) => {
        console.error(e.response.body);
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

  // 테스트 메세지 보내기
  async testMessage(email, testMessageDto) {
    // 유저정보 확인
    const user = await this.usersRepository.findOneByEmail(email);

    const shortenedUrls: string[] = [];
    const idStrings = [];

    for (const url of testMessageDto.urlList) {
      const response = await this.ShortenUrl(url);
      shortenedUrls.push(response.shortURL);
      idStrings.push(response.idString);
    }

    const newContent = await this.replaceUrlContent(
      testMessageDto.urlList,
      shortenedUrls,
      testMessageDto.content,
    );

    const isAdvertisement = testMessageDto.advertisementInfo;

    let contentPrefix = '';
    let contentSuffix = '';

    if (isAdvertisement) {
      contentPrefix = '(광고)';
      contentSuffix = '\n무료수신거부 08012341234';
    }

    const body = {
      type: 'LMS',
      contentType: await this.getCotentType(testMessageDto),
      countryCode: '82',
      from: testMessageDto.hostnumber,
      subject: testMessageDto.title,
      content: testMessageDto.content,
      messages: testMessageDto.receiverList.map((info) => ({
        to: info.phone,
        content: `${contentPrefix} ${this.createMessage(
          newContent,
          info,
        )} ${contentSuffix}`,
      })),
      ...(testMessageDto.reservetime
        ? {
            reserveTime: testMessageDto.reservetime,
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
      return 'success';
    } catch (error) {
      console.log(error);
      throw new BadRequestException(error.response.data);
    }
  }

  // hostnumbercheck 메세지
  async hostNumberCheckMessage(checkHostNumberDto) {
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
        'x-ncp-apigw-signature-v2': await this.makesignature(
          checkHostNumberDto,
          now,
        ),
      };
      const response = await axios.post(
        `https://sens.apigw.ntruss.com/sms/v2/services/${checkHostNumberDto.serviceId}/messages`,
        body,
        {
          headers,
        },
      );

      return 'success';
    } catch (error) {
      console.log(error);
      throw new BadRequestException(error.response.data);
    }
  }

  async makesignature(checkHostNumberDto, timestamp) {
    const message = [];
    const hmac = crypto.createHmac('sha256', checkHostNumberDto.secretKey);
    const space = ' ';
    const newLine = '\n';
    const method = 'POST';
    message.push(method);
    message.push(space);
    message.push(`/sms/v2/services/${checkHostNumberDto.serviceId}/messages`);
    message.push(newLine);
    message.push(timestamp);
    message.push(newLine);
    message.push(checkHostNumberDto.accessKey);

    const signature = hmac.update(message.join('')).digest('base64');
    return signature.toString();
  }

  // AB테스트 메세지 보내기
  async abTestMessage(email, abTestMessageDto) {
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
        `need more points: ${requiredPoints}`,
        HttpStatus.FORBIDDEN,
      );
    }

    let shortenedUrls: string[] = [];
    let idStrings = [];

    const isAdvertisement = abTestMessageDto.advertisementInfo;

    let contentPrefix = '';
    let contentSuffix = '';

    if (isAdvertisement) {
      contentPrefix = '(광고)';
      contentSuffix = '\n무료수신거부 08012341234';
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
        //A 메세지 보내기 + 저장
        for (const url of abTestMessageDto.messageInfoList[0].urlList) {
          const response = await this.ShortenUrl(url);
          shortenedUrls.push(response.shortURL);
          idStrings.push(response.idString);
        }

        const newContent = await this.replaceUrlContent(
          abTestMessageDto.messageInfoList[0].urlList,
          shortenedUrls,
          abTestMessageDto.messageInfoList[0].content,
        );
        const body = {
          type: 'LMS',
          contentType: await this.getCotentType(abTestMessageDto),
          countryCode: '82',
          from: abTestMessageDto.hostnumber,
          subject: abTestMessageDto.messageInfoList[0].title,
          content: abTestMessageDto.messageInfoList[0].content,
          messages: aTestReceiver.map((info) => ({
            to: info.phone,
            content: `${contentPrefix} ${this.createMessage(
              newContent,
              info,
            )} ${contentSuffix}`,
          })),
          ...(abTestMessageDto.reservetime
            ? {
                reserveTime: abTestMessageDto.reservetime,
                reserveTimeZone: 'Asia/Seoul',
              }
            : {}),
        };

        const now = Date.now().toString();
        const headers = {
          'Content-Type': 'application/json; charset=utf-8',
          'x-ncp-iam-access-key': user.accessKey,
          'x-ncp-apigw-timestamp': now,
          'x-ncp-apigw-signature-v2': await this.signature(user, now),
        };
        console.log(user.serviceId, user.accessKey, user.secretKey);
        const response = await axios.post(
          `https://sens.apigw.ntruss.com/sms/v2/services/${user.serviceId}/messages`,
          body,
          {
            headers,
          },
        );
        console.log('!!!!>>');

        const urlForResult = abTestMessageDto.urlForResult;
        const idStringIndex =
          abTestMessageDto.messageInfoList[0].urlList.indexOf(urlForResult);
        const idStringForResult = idStrings[idStringIndex];

        const message = new Message();
        message.isSent = true;
        message.sentType = MessageType.A;
        message.user = user;
        message.receiverList = receiverPhones.slice(0, aTestReceiver.length);
        message.idString = idStrings;
        message.urlForResult = idStringForResult;
        message.requestId = response.data.requestId;
        message.messageGroupId = result.id;
        await this.entityManager.save(message);

        const messageContent = new MessageContent();
        messageContent.messageId = message.messageId;
        messageContent.content = abTestMessageDto.messageInfoList[0];
        messageContent.receiverList = abTestMessageDto.receiverList.slice(
          0,
          aTestReceiver.length,
        );
        messageContent.remainReceiverList =
          abTestMessageDto.receiverList.slice(testReceiverNumber);
        messageContent.sentType = MessageType.A;
        messageContent.hostnumber = abTestMessageDto.hostnumber;

        await this.entityManager.save(messageContent);
      } else if (i < 2) {
        //B 메세지 보내기 + 저장
        shortenedUrls = [];
        idStrings = [];
        for (const url of abTestMessageDto.messageInfoList[1].urlList) {
          const response = await this.ShortenUrl(url);
          shortenedUrls.push(response.shortURL);
          idStrings.push(response.idString);
        }

        const newContent = await this.replaceUrlContent(
          abTestMessageDto.messageInfoList[1].urlList,
          shortenedUrls,
          abTestMessageDto.messageInfoList[1].content,
        );

        const body = {
          type: 'LMS',
          contentType: await this.getCotentType(abTestMessageDto),
          countryCode: '82',
          from: abTestMessageDto.hostnumber,
          subject: abTestMessageDto.messageInfoList[1].title,
          content: abTestMessageDto.messageInfoList[1].content,
          messages: bTestReceiver.map((info) => ({
            to: info.phone,
            content: `${contentPrefix} ${this.createMessage(
              newContent,
              info,
            )} ${contentSuffix}`,
          })),
          ...(abTestMessageDto.reservetime
            ? {
                reserveTime: abTestMessageDto.reservetime,
                reserveTimeZone: 'Asia/Seoul',
              }
            : {}),
        };

        const now = Date.now().toString();
        const headers = {
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

        const urlForResult = abTestMessageDto.urlForResult;
        const idStringIndex =
          abTestMessageDto.messageInfoList[1].urlList.indexOf(urlForResult);
        const idStringForResult = idStrings[idStringIndex];

        const message = new Message();
        message.isSent = true;
        message.sentType = MessageType.B;
        message.user = user;
        message.receiverList = receiverPhones.slice(
          aTestReceiver.length,
          testReceiverNumber,
        );
        message.idString = idStrings;
        message.urlForResult = idStringForResult;
        message.requestId = response.data.requestId;
        message.messageGroupId = result.id;
        await this.entityManager.save(message);

        const messageContent = new MessageContent();
        messageContent.messageId = message.messageId;
        messageContent.content = abTestMessageDto.messageInfoList[1];
        messageContent.receiverList = abTestMessageDto.receiverList.slice(
          aTestReceiver.length,
          testReceiverNumber,
        );
        messageContent.remainReceiverList =
          abTestMessageDto.receiverList.slice(testReceiverNumber);
        messageContent.sentType = MessageType.B;
        messageContent.hostnumber = abTestMessageDto.hostnumber;

        await this.entityManager.save(messageContent);
      } else {
        const message = new Message();
        message.isSent = false;
        message.sentType = MessageType.N;
        message.user = user;
        message.receiverList = receiverPhones.slice(testReceiverNumber);
        message.idString = null;
        message.urlForResult = null;
        message.requestId = null;
        message.messageGroupId = result.id;
        await this.entityManager.save(message);
      }
    }

    // 2시간 뒤에 결과 확인해서 좋은 것으로 보내기

    // db에서 false인 메세지 찾아서 보내고 삭제

    // 유저 금액 차감
    const deductionMoney = receiverPhones.length * 3;
    if (user.point >= deductionMoney) {
      user.point -= deductionMoney;
    } else {
      user.money -= deductionMoney - user.point;
      user.point = 0;
    }

    await this.entityManager.save(user);
    return {
      messageId: '',
      messageGroupId: result.id,
    };
  }
  catch(error) {
    console.log(error);
    throw new error();
  }
}
