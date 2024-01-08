import { AutoMessageEventOrmEntity } from 'src/auto-message-event/adapter/out-persistence/auto-message-event.orm.entity';
import { CreateAutoMessageEventDto } from './dto/create-auto-message-event.dto';
import { UpdateAutoMessageEventDto } from './dto/update-auto-message-event.dto';
import { CreateAutoMessageEventInputDto } from './dto/create-auto-message-event-input.dto';
import { AutoMessageEventInputOrmEntity } from 'src/auto-message-event/adapter/out-persistence/auto-message-event-input.orm.entity';

export interface IAutoMessageEventUseCase {
  createAutoMessageEvent(
    dto: CreateAutoMessageEventDto,
  ): Promise<AutoMessageEventOrmEntity>;
  getAutoMessageEventDetail(
    autoMessageEventId: number,
    email: string,
  ): Promise<AutoMessageEventOrmEntity>;
  getAllAutoMessageEvents(email: string): Promise<any>;
  updateAutoMessageEvent(
    dto: UpdateAutoMessageEventDto,
  ): Promise<AutoMessageEventOrmEntity>;
  deleteAutoMessageEvent(
    autoMessageEventId: number,
    email: string,
  ): Promise<AutoMessageEventOrmEntity>;
  createAutoMessageEventInput(
    dto: CreateAutoMessageEventInputDto,
  ): Promise<AutoMessageEventInputOrmEntity>;
}

export const IAutoMessageEventUseCaseSymbol = Symbol(
  'IAutoMessageEventUseCaseSymbol',
);
