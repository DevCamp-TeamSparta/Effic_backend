import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Inject,
  Post,
  UsePipes,
} from '@nestjs/common';
import { CreateMessageContentDto } from 'src/target/application/port/in/dto/create-message-content.dto';
import { CreateTargetReservationTimeDto } from 'src/target/application/port/in/dto/create-target-reservation-time.dto';
import { CreateTargetTrigger1Dto } from 'src/target/application/port/in/dto/create-target-trigger1.dto';
import { CreateTargetTrigger2Dto } from 'src/target/application/port/in/dto/create-target-trigger2.dto';
import { FilterTargetDto } from 'src/target/application/port/in/dto/filter-target.dto';
import { SmsTargetDto } from 'src/target/application/port/in/dto/sms-target.dto';
import { SmsTestDto } from 'src/target/application/port/in/dto/sms-test.dto';
import { SanitizePhoneNumberPipe } from 'src/target/application/port/in/pipe/sanitize-phone-number.pipe';
import {
  ITargetUseCase,
  ITargetUseCaseSymbol,
} from 'src/target/application/port/in/target.use-case';

@Controller('target')
export class TargetController {
  constructor(
    @Inject(ITargetUseCaseSymbol)
    private readonly targetUseCase: ITargetUseCase,
  ) {}

  @Post('/trigger2')
  @HttpCode(HttpStatus.CREATED)
  async createSegmentTrigger2(@Body() dto: CreateTargetTrigger2Dto) {
    return this.targetUseCase.createTargetTrigger2(dto);
  }

  @Post('/filter')
  @HttpCode(HttpStatus.OK)
  async filterTarget(@Body() dto: FilterTargetDto) {
    return this.targetUseCase.filterTarget(dto);
  }

  @Post('/sms')
  @HttpCode(HttpStatus.CREATED)
  async smsTarget(@Body() dto: SmsTargetDto) {
    return this.targetUseCase.smsTarget(dto);
  }

  @Post('/sms/test')
  @HttpCode(HttpStatus.OK)
  @UsePipes(new SanitizePhoneNumberPipe())
  async smsTest(@Body() dto: SmsTestDto) {
    return this.targetUseCase.smsTest(dto);
  }

  @Post('/message-content')
  @HttpCode(HttpStatus.CREATED)
  async createMessageContent(
    @Body() dto: CreateMessageContentDto,
  ): Promise<TargetData[]> {
    return this.targetUseCase.createMessageContent(dto);
  }

  @Post('/reservation-time')
  @HttpCode(HttpStatus.CREATED)
  async createTargetReservationTime(
    @Body() dto: CreateTargetReservationTimeDto,
  ): Promise<void> {
    return this.targetUseCase.createTargetReservationTime(dto);
  }
}
