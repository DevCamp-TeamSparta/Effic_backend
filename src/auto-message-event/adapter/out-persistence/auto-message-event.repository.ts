import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { IAutoMessageEventPort } from 'src/auto-message-event/application/port/out/auto-message-event.port';
import { Repository } from 'typeorm';
import { AutoMessageEventOrmEntity } from './auto-message-event.orm.entity';
import { AutoMessageEvent } from 'src/auto-message-event/domain/auto-message-event';
import { AutoMessageEventMapper } from './auto-message-event.mapper';
import { UpdateAutoMessageEventDto } from 'src/auto-message-event/application/port/in/dto/update-auto-message-event.dto';
import { AutoMessageEventInputOrmEntity } from './auto-message-event-input.orm.entity';
import { CreateAutoMessageEventInputDto } from 'src/auto-message-event/application/port/in/dto/create-auto-message-event-input.dto';

@Injectable()
export class AutoMessageEventRepository implements IAutoMessageEventPort {
  constructor(
    @InjectRepository(AutoMessageEventOrmEntity)
    private readonly autoMessageEventRepository: Repository<AutoMessageEventOrmEntity>,
    @InjectRepository(AutoMessageEventInputOrmEntity)
    private readonly autoMessageEventInputRepository: Repository<AutoMessageEventInputOrmEntity>,
  ) {}

  async saveAutoMessageEvent(
    autoMessageEvent: AutoMessageEvent,
    userId: number,
    segmentId: number,
  ): Promise<AutoMessageEventOrmEntity> {
    const autoMessageEventOrmEntity =
      AutoMessageEventMapper.mapToAutoMessageEventOrmEntity(
        autoMessageEvent,
        userId,
        segmentId,
      );

    const savedAutoMessageEventOrmEntity =
      await this.autoMessageEventRepository.save(autoMessageEventOrmEntity);
    return savedAutoMessageEventOrmEntity;
  }

  async getAllAutoMessageEvents(userId: number): Promise<AutoMessageEvent[]> {
    return await this.autoMessageEventRepository.find({ where: { userId } });
  }

  async getAutoMessageEventById(
    autoMessageEventId: number,
  ): Promise<AutoMessageEventOrmEntity> {
    return await this.autoMessageEventRepository.findOneBy({
      autoMessageEventId,
    });
  }

  async updateAutoMessageEventById(
    dto: UpdateAutoMessageEventDto,
  ): Promise<AutoMessageEventOrmEntity> {
    const { autoMessageEventId, ...updateData } = dto;

    const autoMessageEventOrmEntity =
      await this.autoMessageEventRepository.findOneBy({ autoMessageEventId });

    if (!autoMessageEventOrmEntity) throw new NotFoundException();

    for (const [key, value] of Object.entries(updateData)) {
      if (value !== undefined) {
        autoMessageEventOrmEntity[key] = value;
      }
    }

    const updatedAutoMessageEventOrmEntity =
      await this.autoMessageEventRepository.save(autoMessageEventOrmEntity);

    return updatedAutoMessageEventOrmEntity;
  }

  async cronGetAllAutoMessageEvents(): Promise<AutoMessageEventOrmEntity[]> {
    return await this.autoMessageEventRepository.find();
  }

  async deleteAutoMessageEventById(
    autoMessageEventId: number,
  ): Promise<AutoMessageEventOrmEntity> {
    const autoMessageEventOrmEntity =
      await this.autoMessageEventRepository.findOne({
        where: { autoMessageEventId },
      });

    if (!autoMessageEventOrmEntity) {
      throw new NotFoundException(`AutoMessageEvent not found`);
    }

    await this.autoMessageEventRepository.remove(autoMessageEventOrmEntity);

    return autoMessageEventOrmEntity;
  }

  async saveAutoMessageEventInput(
    dto: CreateAutoMessageEventInputDto,
  ): Promise<AutoMessageEventInputOrmEntity> {
    const savedAutoMessageEventInputOrmEntity =
      await this.autoMessageEventInputRepository.save(dto);
    return savedAutoMessageEventInputOrmEntity;
  }
}
