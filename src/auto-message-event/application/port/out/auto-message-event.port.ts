import { AutoMessageEventOrmEntity } from 'src/auto-message-event/adapter/out-persistence/auto-message-event.orm.entity';
import { AutoMessageEvent } from 'src/auto-message-event/domain/auto-message-event';

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
    autoMessageEventId: number,
    autoMessageEventName?: string,
    scheduledEndDate?: Date,
  ): Promise<AutoMessageEventOrmEntity>;
  cronGetAllAutoMessageEvents(): Promise<AutoMessageEventOrmEntity[]>;
}

export const IAutoMessageEventPortSymbol = Symbol(
  'IAutoMessageEventPortSymbol',
);
