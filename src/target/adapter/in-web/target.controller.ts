import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Inject,
  Post,
} from '@nestjs/common';
import { CreateTargetTrigger1Dto } from 'src/target/application/port/in/dto/create-target-trigger1.dto';
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
}
