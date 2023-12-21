import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Inject,
  Post,
  Put,
} from '@nestjs/common';
import { CreateAutoMessageEventDto } from 'src/auto-message-event/application/port/in/dto/create-auto-message-event.dto';
import {
  IAutoMessageEventUseCase,
  IAutoMessageEventUseCaseSymbol,
} from 'src/auto-message-event/application/port/in/auto-message-event.use-case';
import { AutoMessageEventOrmEntity } from '../out-persistence/auto-message-event.orm.entity';
import { UpdateAutoMessageEventDto } from 'src/auto-message-event/application/port/in/dto/update-auto-message-event.dto';

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

  @Get('/all')
  @HttpCode(HttpStatus.OK)
  async getAllAutoMessageEvents(): Promise<any> {
    return this.autoMessageEventUseCase.getAllAutoMessageEvents();
  }

  @Put()
  @HttpCode(HttpStatus.OK)
  async updateAutoMessageEvent(
    @Body() dto: UpdateAutoMessageEventDto,
  ): Promise<any> {
    return this.autoMessageEventUseCase.updateAutoMessageEvent(dto);
  }
}
