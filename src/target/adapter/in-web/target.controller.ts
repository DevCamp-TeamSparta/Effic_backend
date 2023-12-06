import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Inject,
  Post,
} from '@nestjs/common';
import { CreateTargetDto } from 'src/target/application/port/in/dto/create-target.dto';
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
}
