import { AutoMessageEventOrmEntity } from 'src/auto-message-event/adapter/out-persistence/auto-message-event.orm.entity';
import { AutoMessageEvent } from 'src/auto-message-event/domain/auto-message-event';

export interface IAutoMessageEventPort {
  saveAutoMessageEvent(
    autoMessageEvent: AutoMessageEvent,
  ): Promise<AutoMessageEventOrmEntity>;
}

export const IAutoMessageEventPortSymbol = Symbol(
  'IAutoMessageEventPortSymbol',
);
