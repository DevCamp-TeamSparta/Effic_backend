import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Inject,
  Post,
} from '@nestjs/common';
import { CreateAutoMessageEventDto } from 'src/auto-message-event/application/port/in/dto/create-auto-message-event.dto';
import {
  IAutoMessageEventUseCase,
  IAutoMessageEventUseCaseSymbol,
} from 'src/auto-message-event/application/port/in/auto-message-event.use-case';
import { AutoMessageEventOrmEntity } from '../out-persistence/auto-message-event.orm.entity';

@Controller('auto-message-event')
export class AutoMessageEventController {
  constructor(
    @Inject(IAutoMessageEventUseCaseSymbol)
    private readonly autoMessageEventUseCase: IAutoMessageEventUseCase,
  ) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async createAutoMessageEvent(
    @Body() dto: CreateAutoMessageEventDto,
  ): Promise<AutoMessageEventOrmEntity> {
    return this.autoMessageEventUseCase.createAutoMessageEvent(dto);
  }
}
