import { AutoMessageEventOrmEntity } from 'src/auto-message-event/adapter/out-persistence/auto-message-event.orm.entity';
import { CreateAutoMessageEventDto } from './dto/create-auto-message-event.dto';

export interface IAutoMessageEventUseCase {
  createAutoMessageEvent(
    dto: CreateAutoMessageEventDto,
  ): Promise<AutoMessageEventOrmEntity>;
  getAllAutoMessageEvents(): Promise<any>;
}

export const IAutoMessageEventUseCaseSymbol = Symbol(
  'IAutoMessageEventUseCaseSymbol',
);
