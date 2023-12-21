import { Inject, Injectable } from '@nestjs/common';
import { CreateAutoMessageEventDto } from '../port/in/dto/create-auto-message-event.dto';
import { AutoMessageEvent } from 'src/auto-message-event/domain/auto-message-event';
import { IAutoMessageEventUseCase } from '../port/in/auto-message-event.use-case';
import {
  IAutoMessageEventPort,
  IAutoMessageEventPortSymbol,
} from '../port/out/auto-message-event.port';
import { AutoMessageEventOrmEntity } from 'src/auto-message-event/adapter/out-persistence/auto-message-event.orm.entity';

@Injectable()
export class AutoMessageEventService implements IAutoMessageEventUseCase {
  constructor(
    @Inject(IAutoMessageEventPortSymbol)
    private readonly autoMessageEventPort: IAutoMessageEventPort,
  ) {}
  async createAutoMessageEvent(
    dto: CreateAutoMessageEventDto,
  ): Promise<AutoMessageEventOrmEntity> {
    const { autoMessageEventName, scheduledEndDate, createdDate, isActive } =
      dto;

    const newAutoMessageEvent = new AutoMessageEvent(
      autoMessageEventName,
      null,
      null,
      null,
      scheduledEndDate,
      createdDate,
      isActive,
    );

    return this.autoMessageEventPort.saveAutoMessageEvent(newAutoMessageEvent);
  }

  async getAllAutoMessageEvents(): Promise<any> {
    return await this.autoMessageEventPort.getAllAutoMessageEvents();
  }
}