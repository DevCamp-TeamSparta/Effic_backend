import { AutoMessageEventOrmEntity } from 'src/auto-message-event/adapter/out-persistence/auto-message-event.orm.entity';
import { AutoMessageEvent } from 'src/auto-message-event/domain/auto-message-event';
import { UpdateAutoMessageEventDto } from '../in/dto/update-auto-message-event.dto';
import { AutoMessageEventInputOrmEntity } from 'src/auto-message-event/adapter/out-persistence/auto-message-event-input.orm.entity';
import { CreateAutoMessageEventInputDto } from '../in/dto/create-auto-message-event-input.dto';

export interface IAutoMessageEventPort {
  saveAutoMessageEvent(
    autoMessageEvent: AutoMessageEvent,
    userId: number,
    segmentId: number,
  ): Promise<AutoMessageEventOrmEntity>;
  getAllAutoMessageEvents(userId: number): Promise<any>;
  getAutoMessageEventById(
    autoMessageEventId: number,
  ): Promise<AutoMessageEventOrmEntity>;
  updateAutoMessageEventById(
    dto: UpdateAutoMessageEventDto,
  ): Promise<AutoMessageEventOrmEntity>;
  cronGetAllAutoMessageEvents(): Promise<AutoMessageEventOrmEntity[]>;
  deleteAutoMessageEventById(
    autoMessageEventId: number,
  ): Promise<AutoMessageEventOrmEntity>;
  saveAutoMessageEventInput(
    dto: CreateAutoMessageEventInputDto,
  ): Promise<AutoMessageEventInputOrmEntity>;
  getAutoMessageEventInputDetail(
    autoMessageEventInputId: number,
  ): Promise<AutoMessageEventInputOrmEntity>;
}

export const IAutoMessageEventPortSymbol = Symbol(
  'IAutoMessageEventPortSymbol',
);
