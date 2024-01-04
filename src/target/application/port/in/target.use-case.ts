import { CreateMessageContentDto } from './dto/create-message-content.dto';
import { CreateTargetReservationTimeDto } from './dto/create-target-reservation-time.dto';
import { SendTestMessageDto } from './dto/send-test-message.dto';
import { SmsTestDto } from './dto/sms-test.dto';

export interface ITargetUseCase {
  smsTest(dto: SmsTestDto): Promise<void>;
  createMessageContent(dto: CreateMessageContentDto): Promise<TargetData[]>;
  createTargetReservationTime(
    dto: CreateTargetReservationTimeDto,
  ): Promise<void>;
  sendReservedMessage(): Promise<void>;
  automateTargetDataProcessing(): Promise<void>;
  sendTestMessage(dto: SendTestMessageDto): Promise<void>;
}

export const ITargetUseCaseSymbol = Symbol('ITargetUseCaseSymbol');
