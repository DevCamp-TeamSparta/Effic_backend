import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { IAutoMessageEventPort } from 'src/auto-message-event/application/port/out/auto-message-event.port';
import { Repository } from 'typeorm';
import { AutoMessageEventOrmEntity } from './auto-message-event.orm.entity';
import { AutoMessageEvent } from 'src/auto-message-event/domain/auto-message-event';
import { AutoMessageEventMapper } from './auto-message-event.mapper';

@Injectable()
export class AutoMessageEventRepository implements IAutoMessageEventPort {
  constructor(
    @InjectRepository(AutoMessageEventOrmEntity)
    private readonly autoMessageEventRepository: Repository<AutoMessageEventOrmEntity>,
  ) {}

  async saveAutoMessageEvent(
    autoMessageEvent: AutoMessageEvent,
  ): Promise<AutoMessageEventOrmEntity> {
    const autoMessageEventOrmEntity =
      AutoMessageEventMapper.mapToAutoMessageEventOrmEntity(autoMessageEvent);

    const savedAutoMessageEventOrmEntity =
      await this.autoMessageEventRepository.save(autoMessageEventOrmEntity);
    return savedAutoMessageEventOrmEntity;
  }

  async getAllAutoMessageEvents(): Promise<AutoMessageEvent[]> {
    return await this.autoMessageEventRepository.find();
  }
}
