import { AutoMessageEvent } from 'src/auto-message-event/domain/auto-message-event';
import { AutoMessageEventOrmEntity } from 'src/auto-message-event/adapter/out-persistence/auto-message-event.orm.entity';

export class AutoMessageEventMapper {
  static mapToAutoMessageEventOrmEntity(autoMessageEvent: AutoMessageEvent) {
    const autoMessageEventEntity = new AutoMessageEventOrmEntity();

    autoMessageEventEntity.autoMessageEventName =
      autoMessageEvent.autoMessageEventName;
    autoMessageEventEntity.totalSentCount = autoMessageEvent.totalSentCount;
    autoMessageEventEntity.clickCount = autoMessageEvent.clickCount;
    autoMessageEventEntity.clickRate = autoMessageEvent.clickRate;
    autoMessageEventEntity.scheduledEndDate = autoMessageEvent.scheduledEndDate;
    autoMessageEventEntity.createdDate = autoMessageEvent.createdDate;
    autoMessageEventEntity.isActive = autoMessageEvent.isActive;

    return autoMessageEventEntity;
  }

  static mapToAutoMessageEvent(
    autoMessageEventEntity: AutoMessageEventOrmEntity,
  ) {
    const autoMessageEvent = new AutoMessageEvent(
      autoMessageEventEntity.autoMessageEventName,
      autoMessageEventEntity.totalSentCount,
      autoMessageEventEntity.clickCount,
      autoMessageEventEntity.clickRate,
      autoMessageEventEntity.scheduledEndDate,
      autoMessageEventEntity.createdDate,
      autoMessageEventEntity.isActive,
    );
    return autoMessageEvent;
  }
}
