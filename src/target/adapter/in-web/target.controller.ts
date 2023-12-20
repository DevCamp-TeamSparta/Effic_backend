import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Inject,
  Post,
} from '@nestjs/common';
import { CreateMessageContentDto } from 'src/target/application/port/in/dto/create-message-content.dto';
import { CreateTargetReservationTime } from 'src/target/application/port/in/dto/create-target-reservation-time.dto';
import { CreateTargetTrigger1Dto } from 'src/target/application/port/in/dto/create-target-trigger1.dto';
import { CreateTargetTrigger2Dto } from 'src/target/application/port/in/dto/create-target-trigger2.dto';
import { FilterTargetDto } from 'src/target/application/port/in/dto/filter-target.dto';
import { SmsTargetDto } from 'src/target/application/port/in/dto/sms-target.dto';
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

  @Post('/trigger1')
  @HttpCode(HttpStatus.CREATED)
  async createSegmentTrigger1(@Body() dto: CreateTargetTrigger1Dto) {
    return this.targetUseCase.createTargetTrigger1(dto);
  }

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
  async smsTest(
    @Body('content') content: string,
    @Body('phoneNumber') phoneNumber: number,
  ) {
    return this.targetUseCase.smsTest(content, phoneNumber);
  }

  @Post('/messageContent')
  @HttpCode(HttpStatus.CREATED)
  async createMessageContent(
    @Body() dto: CreateMessageContentDto,
  ): Promise<TargetData[]> {
    return this.targetUseCase.createMessageContent(dto);
  }

  @Post('/reservation-time')
  @HttpCode(HttpStatus.CREATED)
  async createTargetReservationTime(
    @Body() dto: CreateTargetReservationTime,
  ): Promise<void> {
    return this.targetUseCase.createTargetReservationTime(dto);
  }
}
