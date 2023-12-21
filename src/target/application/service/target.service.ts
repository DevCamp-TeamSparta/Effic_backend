import { Inject, Injectable, RequestMapping } from '@nestjs/common';
import { ITargetUseCase } from '../port/in/target.use-case';
import {
  IClientDbService,
  IClientDbServiceSymbol,
} from 'src/client-db/client-db.interface';
import {
  ISegmentPort,
  ISegmentPortSymbol,
} from 'src/segment/application/port/out/segment.port';
import { ITargetPort, ITargetPortSymbol } from '../port/out/target.port';
import { FilterTargetDto } from '../port/in/dto/filter-target.dto';
import { SmsTargetDto } from '../port/in/dto/sms-target.dto';
import { ISmsPort, ISmsPortSymbol } from '../port/out/sms.port';
import * as crypto from 'crypto';
import axios from 'axios';
import * as dotenv from 'dotenv';
import { CreateTargetTrigger1Dto } from '../port/in/dto/create-target-trigger1.dto';
import { CreateTargetTrigger2Dto } from '../port/in/dto/create-target-trigger2.dto';
import { CreateMessageContentDto } from '../port/in/dto/create-message-content.dto';
import { CreateTargetReservationTimeDto } from '../port/in/dto/create-target-reservation-time.dto';
dotenv.config();

const ACCESS_KEY_ID = process.env.NAVER_ACCESS_KEY_ID;
const SECRET_KEY = process.env.NAVER_SECRET_KEY;
const SMS_SERVICE_ID = process.env.NAVER_SMS_SERVICE_ID;

@Injectable()
export class TargetService implements ITargetUseCase {
  constructor(
    @Inject(ISegmentPortSymbol)
    private readonly segmentPort: ISegmentPort,
    @Inject(IClientDbServiceSymbol)
    private readonly clientDbService: IClientDbService,
    @Inject(ITargetPortSymbol)
    private readonly targetPort: ITargetPort,
    @Inject(ISmsPortSymbol)
    private readonly smsPort: ISmsPort,
  ) {}

  async createTargetTrigger1(
    createTargetTrigger1Dto: CreateTargetTrigger1Dto,
  ): Promise<void> {
    const { segmentId, timeColumnName, sendTime } = createTargetTrigger1Dto;

    const segment = await this.segmentPort.getSegmentDetails(segmentId);

    const excuteQuery = segment.segmentQuery;

    const queryResult = await this.clientDbService.executeQuery(excuteQuery);

    const targets = queryResult.map((customer) => {
      const sendDateTime = new Date(customer[timeColumnName]);
      sendDateTime.setDate(sendDateTime.getDate() + sendTime);

      return {
        customerName: customer.CustomerName,
        phoneNumber: customer.PhoneNumber,
        sendDateTime: sendDateTime.toISOString(), // ISO 8601 형식
      };
    });

    for (const target of targets) {
      await this.targetPort.saveTarget(target, false);
    }
  }

  async createTargetTrigger2(
    createTargetTrigger2Dto: CreateTargetTrigger2Dto,
  ): Promise<void> {
    const { segmentId, sendDateTime } = createTargetTrigger2Dto;

    const segment = await this.segmentPort.getSegmentDetails(segmentId);

    const excuteQuery = segment.segmentQuery;

    const queryResult = await this.clientDbService.executeQuery(excuteQuery);

    const targets = queryResult.map((customer) => {
      return {
        customerName: customer.CustomerName,
        phoneNumber: customer.PhoneNumber,
        sendDateTime: sendDateTime,
      };
    });

    for (const target of targets) {
      await this.targetPort.saveTarget(target, true);
    }
  }

  async filterTarget(filterTargetDto: FilterTargetDto): Promise<void> {
    const { segmentId, columnName, filterData, excludeFilterData } =
      filterTargetDto;

    const segment = await this.segmentPort.getSegmentDetails(segmentId);
    let excuteQuery = segment.segmentQuery;

    excuteQuery = excuteQuery.trim().slice(0, -1);

    const filterQuery = `${excuteQuery} WHERE ${columnName} = '${filterData}';`;

    // console.log(filterQuery);

    const queryResult = await this.clientDbService.executeQuery(filterQuery);

    // console.log(queryResult);

    const filterPhoneNumbers = queryResult.map((entry) => entry.PhoneNumber);
  }

  async smsTarget(smsTargetDto: SmsTargetDto): Promise<void> {
    const { smsContent, senderNumber } = smsTargetDto;

    await this.smsPort.saveSms(smsContent, senderNumber);
  }

  private makeSignature(): string {
    const message = [];
    const hmac = crypto.createHmac('sha256', SECRET_KEY);
    const space = ' ';
    const newLine = '\n';
    const method = 'POST';
    const timestamp = Date.now().toString();
    message.push(method);
    message.push(space);
    message.push(`/sms/v2/services/${SMS_SERVICE_ID}/messages`);
    message.push(newLine);
    message.push(timestamp);
    message.push(newLine);
    message.push(ACCESS_KEY_ID);
    //message 배열에 위의 내용들을 담아준 후에
    const signature = hmac.update(message.join('')).digest('base64');
    //message.join('') 으로 만들어진 string 을 hmac 에 담고, base64로 인코딩
    return signature.toString();
  }

  async smsTest(content: string, phoneNumber: number): Promise<void> {
    const body = {
      type: 'SMS',
      countryCode: '82',
      from: '15228016', // 발신자 번호
      content: `'${content}'`,
      messages: [
        {
          to: phoneNumber, // 수신자 번호
        },
      ],
    };
    const options = {
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
        'x-ncp-iam-access-key': ACCESS_KEY_ID,
        'x-ncp-apigw-timestamp': Date.now().toString(),
        'x-ncp-apigw-signature-v2': this.makeSignature(),
      },
    };
    axios
      .post(
        `https://sens.apigw.ntruss.com/sms/v2/services/${SMS_SERVICE_ID}/messages`,
        body,
        options,
      )
      .then(async (res) => {
        // 성공 이벤트
        console.log(res.data);
      })
      .catch((err) => {
        console.error(err.response.data);
        // Error code : 200인 경우, 다시 같은 번호, 내용으로 메세지 보내기
        if (err.response?.data?.error?.errorCode === '200') {
          console.log(`Retrying SMS for phone number: ${phoneNumber}`);
          return this.smsTest(content, phoneNumber);
        }
      });

    return;
  }

  async createMessageContent(
    dto: CreateMessageContentDto,
  ): Promise<TargetData[]> {
    const {
      segmentId,
      messageTitle,
      messageContentTemplate,
      receiverNumberColumnName,
    } = dto;

    const segment = await this.segmentPort.getSegmentDetails(segmentId);

    const queryResult = await this.clientDbService.executeQuery(
      segment.filterQuery,
    );

    const createdTargets: TargetData[] = [];

    for (const record of queryResult) {
      let messageContent = messageContentTemplate;
      for (const key in record) {
        if (record.hasOwnProperty(key)) {
          const value = record[key] || '';
          const placeholder = new RegExp(`\\$\\{${key}\\}`, 'g');
          messageContent = messageContent.replace(placeholder, value);
        }
      }

      const receiverNumber = record[receiverNumberColumnName];
      const targetData = {
        messageTitle: messageTitle,
        messageContent: messageContent,
        receiverNumber: receiverNumber,
        reservedAt: null,
      };

      const savedEntity = await this.targetPort.saveTarget(targetData, false);

      createdTargets.push({
        ...targetData,
        targetId: savedEntity.targetId,
      });
    }

    return createdTargets;
  }

  async createTargetReservationTime(
    dto: CreateTargetReservationTimeDto,
  ): Promise<void> {
    const {
      targetIds,
      segmentId,
      timeColumnName,
      receiverNumberColumnName,
      delayDays,
      reservationTime,
    } = dto;

    const reservationTimeDate = new Date(reservationTime);

    const targetReceiverMap = await this.targetPort.getReceiverNumbers(
      targetIds,
    );

    const segment = await this.segmentPort.getSegmentDetails(segmentId);

    const queryResult = await this.clientDbService.executeQuery(
      segment.filterQuery,
    );

    for (const record of queryResult) {
      const tempTime = new Date(record[timeColumnName]);

      tempTime.setDate(tempTime.getDate() + delayDays);

      tempTime.setHours(
        reservationTimeDate.getHours(),
        reservationTimeDate.getMinutes(),
        reservationTimeDate.getSeconds(),
      );

      const targetReceiverNumber = record[receiverNumberColumnName];
      const targetId = targetReceiverMap[targetReceiverNumber];

      if (targetId)
        await this.targetPort.updateTargetReservationTime(targetId, tempTime);
    }
  }

  async createTargetReservationTime2(
    dto: CreateTargetReservationTimeDto,
  ): Promise<void> {
    const {
      targetIds,
      segmentId,
      timeColumnName,
      receiverNumberColumnName,
      delayDays,
      reservationTime,
      endDate,
      isRecurring,
      weekDays,
    } = dto;

    const reservationTimeDate = new Date(reservationTime);

    const targetReceiverMap = await this.targetPort.getReceiverNumbers(
      targetIds,
    );

    const segment = await this.segmentPort.getSegmentDetails(segmentId);

    const queryResult = await this.clientDbService.executeQuery(
      segment.filterQuery,
    );

    if (isRecurring) {
      const endDateObj = new Date(endDate);
      for (const record of queryResult) {
        const targetReceiverNumber = record[receiverNumberColumnName];
        const targetId = targetReceiverMap[targetReceiverNumber];

        const reservationDateTimeList = this.getReservationDates(
          weekDays,
          endDateObj,
          reservationTimeDate,
        );

        const targetData = await this.targetPort.getTargetData(targetId);

        for (const reservationDateTime of reservationDateTimeList) {
          const newRecord = {
            ...targetData,
            reservedAt: reservationDateTime,
          };
          await this.targetPort.createTarget(newRecord);
        }

        await this.targetPort.deleteTarget(targetId);
      }
    }

    if (!isRecurring) {
      for (const record of queryResult) {
        const tempTime = new Date(record[timeColumnName]);

        tempTime.setDate(tempTime.getDate() + delayDays);

        tempTime.setHours(
          reservationTimeDate.getHours(),
          reservationTimeDate.getMinutes(),
          reservationTimeDate.getSeconds(),
        );

        const targetReceiverNumber = record[receiverNumberColumnName];
        const targetId = targetReceiverMap[targetReceiverNumber];

        if (targetId)
          await this.targetPort.updateTargetReservationTime(targetId, tempTime);
      }
    }
  }

  private getReservationDates(
    weekDays: string[],
    endDate: Date,
    reservationTime: Date,
  ) {
    const today = new Date();

    endDate.setDate(endDate.getDate() + 1);
    const reservationDates = this.getDatesStartToLast(today, endDate, weekDays);
    const timeString = reservationTime.toISOString().split('T')[1];

    const dateTimeReservations = reservationDates.map((date) => {
      const dateTimeString = date + 'T' + timeString;
      return new Date(dateTimeString);
    });

    return dateTimeReservations;
  }

  private getDatesStartToLast(
    startDate: Date,
    endDate: Date,
    weekDays: string[],
  ) {
    const result = [];
    const currentDate = startDate;

    while (currentDate <= endDate) {
      const dayOfWeek = this.getDayOfWeek(currentDate);

      if (weekDays.includes(dayOfWeek)) {
        result.push(currentDate.toISOString().split('T')[0]);
      }
      currentDate.setDate(currentDate.getDate() + 1);
    }

    return result;
  }

  private getDayOfWeek(date: Date) {
    const week = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    return week[date.getDay()];
  }
}
