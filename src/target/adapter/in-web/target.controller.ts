import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Inject,
  Post,
} from '@nestjs/common';
import { CreateTargetDto } from 'src/target/application/port/in/dto/create-target.dto';
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

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async createSegment(@Body() dto: CreateTargetDto) {
    return this.targetUseCase.createTarget(dto);
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
}
