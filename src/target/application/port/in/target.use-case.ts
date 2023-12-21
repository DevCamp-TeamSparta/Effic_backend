import { SmsTargetDto } from './dto/sms-target.dto';
import { FilterTargetDto } from './dto/filter-target.dto';
import { CreateTargetTrigger1Dto } from './dto/create-target-trigger1.dto';
import { CreateTargetTrigger2Dto } from './dto/create-target-trigger2.dto';
import { CreateMessageContentDto } from './dto/create-message-content.dto';
import { CreateTargetReservationTimeDto } from './dto/create-target-reservation-time.dto';

export interface ITargetUseCase {
  createTargetTrigger1(
    createTargetTrigger1Dto: CreateTargetTrigger1Dto,
  ): Promise<void>;
  createTargetTrigger2(
    createTargetTrigger2Dto: CreateTargetTrigger2Dto,
  ): Promise<void>;
  filterTarget(filterTargetDto: FilterTargetDto): Promise<void>;
  smsTarget(smsTargetDto: SmsTargetDto): Promise<void>;
  smsTest(content: string, phoneNumber: number): Promise<void>;
  createMessageContent(dto: CreateMessageContentDto): Promise<TargetData[]>;
  createTargetReservationTime(
    dto: CreateTargetReservationTimeDto,
  ): Promise<void>;
  createTargetReservationTime2(
    dto: CreateTargetReservationTimeDto,
  ): Promise<void>;
}

export const ITargetUseCaseSymbol = Symbol('ITargetUseCaseSymbol');