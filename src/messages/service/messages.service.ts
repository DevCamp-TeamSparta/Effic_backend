import {
  Injectable,
  HttpException,
  HttpStatus,
  Logger,
  Inject,
} from '@nestjs/common';
import { EntityManager } from 'typeorm';
import { InjectEntityManager } from '@nestjs/typeorm';
import { UsersService } from '../../users/service/users.service';
import { ShorturlService } from '../../shorturl/service/shorturl.service';
import * as crypto from 'crypto';
import axios from 'axios';
import { Message, AdvertiseReceiverList } from '../message.entity';
import { MessageType } from '../message.enum';
import { MessageContent } from '../message.entity';
import {
  MessageGroupRepo,
  MessagesContentRepository,
  MessagesRepository,
} from '../messages.repository';
import { AdvertiseReceiverListRepository } from '../messages.repository';
import { UsedPayments } from 'src/results/entity/result.entity';
import {
  NCP_contentPrefix,
  NCP_contentSuffix,
  NCP_SMS_price,
} from '../../../commons/constants';
import {
  ISegmentPort,
  ISegmentPortSymbol,
} from 'src/segment/application/port/out/segment.port';

@Injectable()
export class MessagesService {
  private readonly logger = new Logger('NcpMessagesService');
  constructor(
    private readonly usersService: UsersService,
    private readonly shorturlService: ShorturlService,
    private readonly messageGroupRepo: MessageGroupRepo,
    private readonly messagesRepository: MessagesRepository,
    private readonly messagesContentRepository: MessagesContentRepository,
    private readonly advertiseReceiverListRepository: AdvertiseReceiverListRepository,
    @Inject(ISegmentPortSymbol)
    private readonly segmentPort: ISegmentPort,
    @InjectEntityManager() private readonly entityManager: EntityManager,
  ) {}

  async getGroupList(email: string) {
    const user = await this.usersService.findOneByEmail(email);
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

  createMessageWithVariable(content: string, info: { [key: string]: string }) {
    Object.keys(info).forEach((key) => {
      const regex = new RegExp(`#{${key}}`, 'g');
      content = content.replace(regex, info[key]);
    });
    return content;
  }

  // 기본메세지 보내기
  async sendDefaultMessage(email, defaultMessageDto) {
    // 유저정보 확인
    const user = await this.usersService.findOneByEmail(email);

    const receiverPhones = defaultMessageDto.receiverList.map(
      (info) => info.phone,
    );

    await this.usersService.assertCheckUserMoney(
      user.userId,
      receiverPhones.length,
      NCP_SMS_price,
    );

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

    if (defaultMessageDto.advertiseInfo === true) {
      await this.saveAdvertiseReceiverList(
        defaultMessageDto.receiverList,
        user.userId,
        saveMessageInfo.messageGroupId,
        new Date(),
      );
    }

    return {
      messageId: saveMessageInfo.messageId,
      messageGroupId: saveMessageInfo.messageGroupId,
    };
  }

  async makeBody(user, messageInfoList, messageDto, receiverList) {
    const shortenedUrls = [];
    const idStrings = [];

    const userNcpInfo = await this.usersService.findUserNcpInfoByUserId(
      user.userId,
    );

    if (messageInfoList.urlList) {
      for (const url of messageInfoList.urlList) {
        const response = await this.shorturlService.createShorturl(url);
        shortenedUrls.push(response.shortURL);
        idStrings.push(response.idString);
      }
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
      contentPrefix = NCP_contentPrefix;
      contentSuffix = `${NCP_contentSuffix} ${userNcpInfo.advertiseNumber}`;
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
        content: `${contentPrefix} ${this.createMessageWithVariable(
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
        'x-ncp-iam-access-key': userNcpInfo.accessKey,
        'x-ncp-apigw-timestamp': now,
        'x-ncp-apigw-signature-v2': await this.makeSignature(userNcpInfo, now),
      };
      const response = await axios.post(
        `https://sens.apigw.ntruss.com/sms/v2/services/${userNcpInfo.serviceId}/messages`,
        body,
        {
          headers,
        },
      );
      /**피로도 관리를 위한 문자 발송 기록 */
      if (response.status === 202) {
        const res = JSON.parse(response.config.data);

        const content = res.content;
        const phoneNumber = res.messages[0].to;
        const requestTime = response.data.requestTime;

        await this.segmentPort.saveMessageHistory(
          phoneNumber,
          content,
          requestTime,
        );
      }
      return { body, response, idStrings, shortenedUrls };
    } catch (error) {
      throw new HttpException(error.response.data, HttpStatus.BAD_REQUEST);
    }
  }

  async makeSignature(userNcpInfo, timestamp) {
    const message = [];
    const hmac = crypto.createHmac('sha256', userNcpInfo.secretKey);
    const space = ' ';
    const newLine = '\n';
    const method = 'POST';
    message.push(method);
    message.push(space);
    message.push(`/sms/v2/services/${userNcpInfo.serviceId}/messages`);
    message.push(newLine);
    message.push(timestamp);
    message.push(newLine);
    message.push(userNcpInfo.accessKey);

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
    messageContent.autoMessageEventId = messageInfoDto.autoMessageEventId;

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
    const deductionMoney = receiverPhones.length * NCP_SMS_price;
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
    const user = await this.usersService.findOneByEmail(email);

    await this.makeBody(
      user,
      testMessageDto,
      testMessageDto,
      testMessageDto.receiverList,
    );

    return 'success';
  }

  // hostnumbercheck 메세지 보내기
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
    const user = await this.usersService.findOneByEmail(email);

    const receiverPhones = abTestMessageDto.receiverList.map(
      (info) => info.phone,
    );

    // 유저 금액 확인
    await this.usersService.assertCheckUserMoney(
      user.userId,
      receiverPhones.length * 3,
      NCP_SMS_price,
    );

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
    let takeAbMessageInfo;
    // A, B 메세지 보내기
    for (let i = 0; i < 3; i++) {
      // A 메세지 보내기 + 저장
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

        let idStringForResult = null;
        if (abTestMessageDto.urlForResult) {
          const urlForResult = abTestMessageDto.urlForResult;
          const idStringIndex =
            abTestMessageDto.messageInfoList[0].urlList.indexOf(urlForResult);
          idStringForResult = takeBody.idStrings[idStringIndex];
        }

        const AbMessageInfo = await this.saveAbMessageInfo(
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
        takeAbMessageInfo = AbMessageInfo;
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

        let idStringForResult = null;
        if (abTestMessageDto.urlForResult) {
          const urlForResult = abTestMessageDto.urlForResult;
          const idStringIndex =
            abTestMessageDto.messageInfoList[1].urlList.indexOf(urlForResult);
          idStringForResult = takeBody.idStrings[idStringIndex];
        }

        const AbMessageInfo = await this.saveAbMessageInfo(
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
        takeAbMessageInfo = AbMessageInfo;
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
    await this.deductedUserMoney(user, receiverPhones, takeAbMessageInfo);

    if (abTestMessageDto.messageInfoList[0].advertiseInfo === true) {
      await this.saveAdvertiseReceiverList(
        abTestMessageDto.receiverList,
        user.userId,
        result.id,
        new Date(),
      );
    } else if (abTestMessageDto.messageInfoList[1].advertiseInfo === true) {
      await this.saveAdvertiseReceiverList(
        abTestMessageDto.receiverList,
        user.userId,
        result.id,
        new Date(),
      );
    }

    return {
      messageGroupId: result.id,
    };
  }
  catch(error) {
    console.log(error);
    throw new HttpException(error.response.data, HttpStatus.BAD_REQUEST);
  }

  // AdvertiseReceiverList 저장
  async saveAdvertiseReceiverList(receiverList, userId, messageGroupId, now) {
    for (let i = 0; i < receiverList.length; i++) {
      const allReceiverList = new AdvertiseReceiverList();
      allReceiverList.number = receiverList[i].phone;
      allReceiverList.userId = userId;
      allReceiverList.messageGroupId = messageGroupId;
      allReceiverList.sentAt = now;
      await this.entityManager.save(allReceiverList);
    }
  }

  // 광고성 문자 수신자 필터링
  async filteredReceivers(email, filterReceiverDto) {
    const user = await this.usersService.findOneByEmail(email);
    const settingDay = filterReceiverDto.day;

    const DaysAgo = new Date();
    DaysAgo.setDate(DaysAgo.getDate() - settingDay);
    const DaysAgoDate = DaysAgo.toISOString().slice(0, 10);

    const allReceiverList =
      await this.advertiseReceiverListRepository.findAllByUserIdAndSentAt(
        user.userId,
        DaysAgoDate,
      );

    const filterReceiverList = filterReceiverDto.receiverList;
    const result = filterReceiverList.filter(
      (x) => !allReceiverList.some((y) => y.number === x),
    );

    return result;
  }

  // message info 가져오기
  async findOneByMessageId(messageId: number) {
    const message = await this.messagesRepository.findOneByMessageId(messageId);
    return message;
  }

  // messageGroup info 가져오기
  async findAllMessageGroupByUserId(userId: number) {
    const messageGroupList = await this.messageGroupRepo.findAllByUserId(
      userId,
    );
    return messageGroupList;
  }

  async findOneMessageGroupByMessageGroupId(messageGroupId: number) {
    const messageGroup = await this.messageGroupRepo.findOneByMessageGroupId(
      messageGroupId,
    );
    return messageGroup;
  }

  async findAllMessageByMessageGroupId(messageGroupId: number) {
    const messageList = await this.messagesRepository.findAllByMessageGroupId(
      messageGroupId,
    );
    return messageList;
  }

  // messageContent info 가져오기
  async findOneMessageContentByMessageGroupId(messageGroupId: number) {
    const messageContent =
      await this.messagesContentRepository.findOneByMessageGroupId(
        messageGroupId,
      );
    return messageContent;
  }

  async findOneMessageContentByMessageId(messageId: number) {
    const messageContent =
      await this.messagesContentRepository.findOneByMessageId(messageId);
    return messageContent;
  }

  // messagerepo info 가져오기 (날짜)
  async findThreeDaysBeforeSend() {
    const messages = await this.messagesRepository.findThreeDaysBeforeSend();
    return messages;
  }

  async findThreeDaysBeforeSendAndNotChecked() {
    const messages =
      await this.messagesRepository.findThreeDaysBeforeSendAndNotChecked();
    return messages;
  }

  async findNotSend() {
    const messages = await this.messagesRepository.findNotSend();
    return messages;
  }
}
