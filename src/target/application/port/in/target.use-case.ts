import { CreateMessageContentDto } from './dto/create-message-content.dto';
import { CreateTargetReservationTimeDto } from './dto/create-target-reservation-time.dto';
import { SmsTestDto } from './dto/sms-test.dto';

export interface ITargetUseCase {
  smsTest(dto: SmsTestDto): Promise<void>;
  createMessageContent(dto: CreateMessageContentDto): Promise<TargetData[]>;
  createTargetReservationTime(
    dto: CreateTargetReservationTimeDto,
  ): Promise<void>;
  sendReservedMessage(): Promise<void>;
}

export const ITargetUseCaseSymbol = Symbol('ITargetUseCaseSymbol');
