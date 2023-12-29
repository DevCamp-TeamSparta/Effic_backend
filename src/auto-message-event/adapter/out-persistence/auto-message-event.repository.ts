import { Injectable, NotFoundException } from '@nestjs/common';
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
    userId: number,
  ): Promise<AutoMessageEventOrmEntity> {
    const autoMessageEventOrmEntity =
      AutoMessageEventMapper.mapToAutoMessageEventOrmEntity(
        autoMessageEvent,
        userId,
      );

    const savedAutoMessageEventOrmEntity =
      await this.autoMessageEventRepository.save(autoMessageEventOrmEntity);
    return savedAutoMessageEventOrmEntity;
  }

  async getAllAutoMessageEvents(userId: number): Promise<AutoMessageEvent[]> {
    return await this.autoMessageEventRepository.find();
  }

  async getAutoMessageEventById(
    autoMessageEventId: number,
  ): Promise<AutoMessageEventOrmEntity> {
    return await this.autoMessageEventRepository.findOneBy({
      autoMessageEventId,
    });
  }

  async updateAutoMessageEventById(
    autoMessageEventId: number,
    autoMessageEventName?: string,
    scheduledEndDate?: Date,
  ): Promise<AutoMessageEventOrmEntity> {
    const autoMessageEventOrmEntity =
      await this.autoMessageEventRepository.findOneBy({
        autoMessageEventId,
      });

    if (!autoMessageEventOrmEntity) throw new NotFoundException();

    if (autoMessageEventName) {
      autoMessageEventOrmEntity.autoMessageEventName = autoMessageEventName;
    }

    if (scheduledEndDate) {
      autoMessageEventOrmEntity.scheduledEndDate = scheduledEndDate;
    }

    const updatedAutoMessageEventOrmEntity =
      await this.autoMessageEventRepository.save(autoMessageEventOrmEntity);

    return updatedAutoMessageEventOrmEntity;
  }
}
