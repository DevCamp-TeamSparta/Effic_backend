import { Inject, Injectable, Logger } from '@nestjs/common';
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
import * as dotenv from 'dotenv';
import { CreateMessageContentDto } from '../port/in/dto/create-message-content.dto';
import { CreateTargetReservationTimeDto } from '../port/in/dto/create-target-reservation-time.dto';
import {
  ISegmentUseCase,
  ISegmentUseCaseSymbol,
} from 'src/segment/application/port/in/segment.use-case';
import {
  IAutoMessageEventPort,
  IAutoMessageEventPortSymbol,
} from 'src/auto-message-event/application/port/out/auto-message-event.port';
import {
  IClientDbPort,
  IClientDbPortSymbol,
} from 'src/client-db/client-db.port';
import { AutoMessageEventOrmEntity } from 'src/auto-message-event/adapter/out-persistence/auto-message-event.orm.entity';
import { MessagesService } from 'src/messages/service/messages.service';
import { UsersRepository } from 'src/users/users.repository';
import { SendTestMessageDto } from '../port/in/dto/send-test-message.dto';
dotenv.config();

const ACCESS_KEY_ID = process.env.NAVER_ACCESS_KEY_ID;
const SECRET_KEY = process.env.NAVER_SECRET_KEY;
const SMS_SERVICE_ID = process.env.NAVER_SMS_SERVICE_ID;

@Injectable()
export class TargetService implements ITargetUseCase {
  private logger = new Logger('TargetService');
  constructor(
    @Inject(ISegmentPortSymbol)
    private readonly segmentPort: ISegmentPort,
    @Inject(IClientDbServiceSymbol)
    private readonly clientDbService: IClientDbService,
    @Inject(IClientDbPortSymbol)
    private readonly clientDbPort: IClientDbPort,
    @Inject(ITargetPortSymbol)
    private readonly targetPort: ITargetPort,
    @Inject(ISegmentUseCaseSymbol)
    private readonly segmentUseCase: ISegmentUseCase,
    @Inject(IAutoMessageEventPortSymbol)
    private readonly autoMessageEventPort: IAutoMessageEventPort,
    private messagesService: MessagesService,
    private readonly usersRepository: UsersRepository,
  ) {}

  async sendTestMessage(dto: SendTestMessageDto): Promise<void> {
    const {
      hostnumber,
      title,
      content,
      receiverNumber,
      advertiseInfo,
      email,
      autoMessageEventId,
    } = dto;

    const receiverList = this.makeReceiverList(receiverNumber);

    const defaultMessageDto = {
      hostnumber,
      title,
      content,
      receiverList,
      advertiseInfo,
      autoMessageEventId,
    };

    this.logger.debug(
      `\n📨 defaultMessageDto: ${JSON.stringify(defaultMessageDto)}`,
    );
    await this.messagesService.sendDefaultMessage(email, defaultMessageDto);
  }

  /**
   * defaultMessageDto의 형식에 맞추기 위한 함수
   */
  private makeReceiverList(receiverNumber: string): string[] {
    const receiverList = [];
    receiverList.push({
      phone: receiverNumber,
    });
    return receiverList;
  }

  /**MessageContent를 생성하고 Target 테이블에 저장 */
  async createMessageContent(
    dto: CreateMessageContentDto,
  ): Promise<TargetData[]> {
    this.logger.verbose('createMessageContent');
    const {
      segmentId,
      messageTitle,
      messageContentTemplate,
      receiverNumberColumnName,
      hostnumber,
      advertiseInfo,
      email,
      autoMessageEventId,
    } = dto;

    await this.segmentUseCase.checkUserIsSegmentCreator(email, segmentId);

    const segment = await this.segmentPort.getSegmentDetails(segmentId);

    const queryResult = await this.clientDbService.executeQueryPg(
      segment.filterQuery,
    );

    return this.processAndSaveMessageContent(
      queryResult,
      messageTitle,
      messageContentTemplate,
      receiverNumberColumnName,
      hostnumber,
      advertiseInfo,
      email,
      autoMessageEventId,
    );
  }

  async createTargetReservationTime(
    dto: CreateTargetReservationTimeDto,
  ): Promise<void> {
    this.logger.verbose('createTargetReservationTime');
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
      email,
    } = dto;

    // segment 생성자와 email이 같은지 확인
    await this.segmentUseCase.checkUserIsSegmentCreator(email, segmentId);

    // { phoneNumber: targetId } 딕셔너리 생성
    const phoneNumberToTargetIdMap = await this.targetPort.getReceiverNumbers(
      targetIds,
    );

    const segment = await this.segmentPort.getSegmentDetails(segmentId);
    const queryResult = await this.clientDbService.executeQueryPg(
      segment.filterQuery,
    );

    if (isRecurring) {
      // 주기 발송
      await this.handleRecurringReservations(
        queryResult,
        phoneNumberToTargetIdMap,
        receiverNumberColumnName,
        weekDays,
        endDate,
        reservationTime,
      );
    } else {
      // N일 뒤 발송
      await this.handleNonRecurringReservations(
        queryResult,
        phoneNumberToTargetIdMap,
        timeColumnName,
        receiverNumberColumnName,
        delayDays,
        reservationTime,
      );
    }
  }

  async sendReservedMessage(): Promise<void> {
    this.logger.verbose('sendReservedMessage');

    const targets = await this.targetPort.getUnsentTargets();

    for (const target of targets) {
      if (target.reservedAt === null) continue;

      const reservedAt = new Date(target.reservedAt);
      const currentTime = new Date();

      if (reservedAt <= currentTime) {
        await this.targetPort.updateSentStatus(target.targetId, true);
        const receiverList = [];
        receiverList.push({
          phone: target.receiverNumber.replace(/-/g, ''),
        });

        const defaultMessageDto = {
          hostnumber: target.hostnumber,
          title: target.messageTitle,
          content: target.messageContent,
          receiverList: receiverList,
          advertiseInfo: target.advertiseInfo,
          autoMessageEventId: target.autoMessageEventId,
        };

        this.logger.debug(
          `\n📨 defaultMessageDto: ${JSON.stringify(defaultMessageDto)}`,
        );
        // await this.messagesService.sendDefaultMessage(
        //   target.email,
        //   defaultMessageDto,
        // );
      }
    }
  }

  async automateTargetDataProcessing(): Promise<void> {
    this.logger.verbose('automateTargetDataProcessing');
    const autoMessageEvents =
      await this.autoMessageEventPort.cronGetAllAutoMessageEvents();

    for (const autoMessageEvent of autoMessageEvents) {
      const {
        autoMessageEventId,
        segmentId,
        updatedAtColumnName,
        autoMessageEventLastRunTime,
        isReserved,
        receiverNumberColumnName,
        messageTitle,
        messageContentTemplate,
        hostnumber,
        advertiseInfo,
      } = autoMessageEvent;

      if (!autoMessageEventLastRunTime) {
        const updateAutoMessageEventDto = {
          autoMessageEventId,
          autoMessageEventLastRunTime: new Date('2000-01-01T00:00:00.000Z'),
        };
        await this.autoMessageEventPort.updateAutoMessageEventById(
          updateAutoMessageEventDto,
        );
      }

      const segmentDetail = await this.segmentPort.getSegmentDetails(segmentId);

      await this.connectToClientDatabase(segmentDetail.clientDbId);
      const email = await this.getUserEmailById(segmentDetail.userId);

      if (!segmentDetail.filterQuery) continue;

      const filterQueryResults = await this.clientDbService.executeQueryPg(
        segmentDetail.filterQuery,
      );

      const updatedResult = filterQueryResults.filter((filterQueryResult) => {
        const updatedAtValue = new Date(filterQueryResult[updatedAtColumnName]);
        return updatedAtValue >= autoMessageEventLastRunTime;
      });

      const updateAutoMessageEventDto = {
        autoMessageEventId,
        autoMessageEventLastRunTime: new Date(),
      };

      if (isReserved) {
        const updatedTargets = await this.processAndSaveMessageContent(
          updatedResult,
          messageTitle,
          messageContentTemplate,
          receiverNumberColumnName,
          hostnumber,
          advertiseInfo,
          email,
          autoMessageEventId,
        );

        const updatedTargetIds = [];
        for (const target of updatedTargets) {
          updatedTargetIds.push(target.targetId);
        }

        await this.cronTargetReservationTime(
          autoMessageEvent,
          updatedTargetIds,
          updatedResult,
        );
        await this.autoMessageEventPort.updateAutoMessageEventById(
          updateAutoMessageEventDto,
        );
      }

      if (!isReserved) {
        const updatedTargets = await this.processAndSaveMessageContent(
          updatedResult,
          messageTitle,
          messageContentTemplate,
          receiverNumberColumnName,
          hostnumber,
          advertiseInfo,
          email,
          autoMessageEventId,
        );

        const updatedTargetIds = [];
        for (const target of updatedTargets) {
          updatedTargetIds.push(target.targetId);
        }

        for (const targetId of updatedTargetIds) {
          const targetData = await this.targetPort.getTargetData(targetId);

          const receiverList = [];
          receiverList.push({
            phone: targetData.receiverNumber.replace(/-/g, ''),
          });

          const defaultMessageDto = {
            hostnumber: targetData.hostnumber,
            title: targetData.messageTitle,
            content: targetData.messageContent,
            receiverList: receiverList,
            advertiseInfo: targetData.advertiseInfo,
            autoMessageEventId: targetData.autoMessageEventId,
          };

          this.logger.debug(
            `\n📨 defaultMessageDto: ${JSON.stringify(defaultMessageDto)}`,
          );
          // await this.messagesService.sendDefaultMessage(
          //   email,
          //   defaultMessageDto,
          // );
          await this.autoMessageEventPort.updateAutoMessageEventById(
            updateAutoMessageEventDto,
          );
        }
      }
    }
    return;
  }

  private async processAndSaveMessageContent(
    queryResult,
    messageTitle: string,
    messageContentTemplate: string,
    receiverNumberColumnName: string,
    hostnumber: string,
    advertiseInfo: boolean,
    email: string,
    autoMessageEventId: number,
  ): Promise<TargetData[]> {
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

      const targetData: TargetData = {
        messageTitle,
        messageContent,
        receiverNumber,
        reservedAt: null,
        hostnumber,
        advertiseInfo,
        email,
        autoMessageEventId,
      };

      if (!targetData.receiverNumber) continue;

      const savedEntity = await this.targetPort.saveTarget(targetData, false);

      createdTargets.push({
        ...targetData,
        targetId: savedEntity.targetId,
      });
    }

    return createdTargets;
  }

  private async getUserEmailById(userId: number) {
    const user = await this.usersRepository.findOneByUserId(userId);
    return user.email;
  }

  private async cronTargetReservationTime(
    autoMessageEvent: AutoMessageEventOrmEntity,
    targetIds: number[],
    queryResult,
  ): Promise<void> {
    const {
      reservationTime,
      isRecurring,
      receiverNumberColumnName,
      weekDays,
      endDate,
      timeColumnName,
      delayDays,
    } = autoMessageEvent;

    const reservationTimeDate = new Date(reservationTime);
    const phoneNumberToTargetIdMap = await this.targetPort.getReceiverNumbers(
      targetIds,
    );

    if (isRecurring) {
      await this.handleRecurringReservations(
        queryResult,
        phoneNumberToTargetIdMap,
        receiverNumberColumnName,
        weekDays,
        endDate,
        reservationTimeDate,
      );
    } else {
      await this.handleNonRecurringReservations(
        queryResult,
        phoneNumberToTargetIdMap,
        timeColumnName,
        receiverNumberColumnName,
        delayDays,
        reservationTimeDate,
      );
    }
  }

  private async connectToClientDatabase(clientDbId: number): Promise<void> {
    const clientDbInfo = await this.clientDbPort.getClientDbInfo(clientDbId);
    await this.clientDbService.connectToPg(clientDbInfo);
  }

  /**
   * FilterQuery의 결과인 queryResult
   * - queryResult가 target
   * - target의 각 레코드에 대해 예약 시간을 설정하는 함수
   */
  private async handleRecurringReservations(
    queryResult: any[],
    phoneNumberToTargetIdMap: Record<string, number>,
    receiverNumberColumnName: string,
    weekDays: string[],
    endDate: Date,
    reservationTimeDate: Date,
  ): Promise<void> {
    const endDateObj = new Date(endDate);

    for (const record of queryResult) {
      const targetReceiverNumber = record[receiverNumberColumnName];
      const targetId = phoneNumberToTargetIdMap[targetReceiverNumber];
      const reservationDateTimeList = this.getReservationDates(
        weekDays,
        endDateObj,
        reservationTimeDate,
      );

      const targetData = await this.targetPort.getTargetData(targetId);
      for (const reservationDateTime of reservationDateTimeList) {
        const newRecord = { ...targetData, reservedAt: reservationDateTime };
        await this.targetPort.createTarget(newRecord);
      }

      await this.targetPort.deleteTarget(targetId);
    }
  }

  private async handleNonRecurringReservations(
    queryResult: any[],
    phoneNumberToTargetIdMap: Record<string, number>,
    timeColumnName: string,
    receiverNumberColumnName: string,
    delayDays: number,
    reservationTimeDate: Date,
  ): Promise<void> {
    for (const record of queryResult) {
      const tempTime = this.calculateNonRecurringTime(
        record,
        timeColumnName,
        delayDays,
        reservationTimeDate,
      );
      const targetReceiverNumber = record[receiverNumberColumnName];
      const targetId = phoneNumberToTargetIdMap[targetReceiverNumber];
      if (targetId) {
        await this.targetPort.updateTargetReservationTime(targetId, tempTime);
      }
    }
  }

  private calculateNonRecurringTime(
    record: any,
    timeColumnName: string,
    delayDays: number,
    reservationTimeDate: Date,
  ): Date {
    const tempTime = new Date(record[timeColumnName]);
    tempTime.setDate(tempTime.getDate() + delayDays);
    tempTime.setHours(
      reservationTimeDate.getHours(),
      reservationTimeDate.getMinutes(),
      reservationTimeDate.getSeconds(),
    );
    return tempTime;
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
