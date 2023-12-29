import { SmsTargetDto } from './dto/sms-target.dto';
import { CreateMessageContentDto } from './dto/create-message-content.dto';
import { CreateTargetReservationTimeDto } from './dto/create-target-reservation-time.dto';
import { SmsTestDto } from './dto/sms-test.dto';

export interface ITargetUseCase {
  smsTarget(smsTargetDto: SmsTargetDto): Promise<void>;
  smsTest(dto: SmsTestDto): Promise<void>;
  createMessageContent(dto: CreateMessageContentDto): Promise<TargetData[]>;
  createTargetReservationTime(
    dto: CreateTargetReservationTimeDto,
  ): Promise<void>;
}

export const ITargetUseCaseSymbol = Symbol('ITargetUseCaseSymbol');
