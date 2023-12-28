import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SegmentOrmEntity } from './segment.orm.entity';
import { Segment } from 'src/segment/domain/segment';
import { SegmentMapper } from './segment.mapper';
import { ISegmentPort } from 'src/segment/application/port/out/segment.port';
import { MessageHistoryOrmEntity } from './message-history.orm.entity';
import { UpdateSegmentDto } from 'src/segment/application/port/in/dto/update-segment.dto';

@Injectable()
export class SegmentRepository implements ISegmentPort {
  constructor(
    @InjectRepository(SegmentOrmEntity)
    private readonly segmentRepository: Repository<SegmentOrmEntity>,
    @InjectRepository(MessageHistoryOrmEntity)
    private readonly messageHistoryRepository: Repository<MessageHistoryOrmEntity>,
  ) {}

  async saveSegment(
    segment: Segment,
    userId: number,
  ): Promise<SegmentOrmEntity> {
    const segmentOrmEntity = SegmentMapper.mapToSegmentOrmEntity(
      segment,
      userId,
    );

    const savedSegmentOrmEntity = await this.segmentRepository.save(
      segmentOrmEntity,
    );
    return savedSegmentOrmEntity;
  }

  async updateSegment(dto: UpdateSegmentDto): Promise<SegmentOrmEntity> {
    const { segmentId, segmentName, segmentDescription, updatedAt } = dto;
    const segmentOrmEntity = await this.segmentRepository.findOneBy({
      segmentId,
    });
    if (!segmentOrmEntity) throw new Error('Segment not found');

    if (segmentName) segmentOrmEntity.segmentName = segmentName;
    if (segmentDescription)
      segmentOrmEntity.segmentDescription = segmentDescription;

    segmentOrmEntity.updatedAt = updatedAt;

    await this.segmentRepository.save(segmentOrmEntity);

    return segmentOrmEntity;
  }

  async getSegmentDetails(segmentId: number): Promise<SegmentOrmEntity> {
    const segmentOrmEntity = await this.segmentRepository.findOne({
      where: { segmentId },
    });
    if (!segmentOrmEntity) throw new Error('Segment not found');

    return segmentOrmEntity;
  }

  async updateSegmentQuery(
    segmentId: number,
    segmentQuery: string,
  ): Promise<Segment> {
    const segmentOrmEntity = await this.segmentRepository.findOneBy({
      segmentId,
    });
    if (!segmentOrmEntity) throw new Error('Segment not found');

    segmentOrmEntity.segmentQuery = segmentQuery;

    await this.segmentRepository.save(segmentOrmEntity);

    const updatedSegment = SegmentMapper.mapToUserQuery(segmentOrmEntity);
    return updatedSegment;
  }

  async getAllSegments(userId: number): Promise<Segment[]> {
    const segmentOrmEntities = await this.segmentRepository.find({
      where: { userId },
    });

    const segments = segmentOrmEntities.map((segmentOrmEntity) =>
      SegmentMapper.mapToUserQuery(segmentOrmEntity),
    );

    return segments;
  }

  async updateFilterQuery(
    segmentId: number,
    filterQuery: string,
  ): Promise<Segment> {
    const segmentOrmEntity = await this.segmentRepository.findOneBy({
      segmentId,
    });

    if (!segmentOrmEntity) {
      throw new Error('Segment not found');
    }

    segmentOrmEntity.filterQuery = filterQuery;

    await this.segmentRepository.save(segmentOrmEntity);

    return SegmentMapper.mapToUserQuery(segmentOrmEntity);
  }

  async saveMessageHistory(
    phoneNumber: string,
    content: string,
    deliveredAt: string,
  ): Promise<MessageHistoryOrmEntity> {
    const deliveredAtDate = new Date(deliveredAt);

    const messageHistoryEntity = new MessageHistoryOrmEntity();
    messageHistoryEntity.phoneNumber = phoneNumber;
    messageHistoryEntity.content = content;
    messageHistoryEntity.deliveredAt = deliveredAtDate;

    await this.messageHistoryRepository.delete({ phoneNumber: phoneNumber });

    const savedMessageHistoryOrmEntity =
      await this.messageHistoryRepository.save(messageHistoryEntity);
    return savedMessageHistoryOrmEntity;
  }

  async getMessageHistoryByPhoneNumber(
    phoneNumber: string,
  ): Promise<MessageHistoryOrmEntity[]> {
    const formattedPhoneNumber = phoneNumber.replace(/-/g, '').slice(1);

    const messageHistoryResult = await this.messageHistoryRepository.find({
      where: { phoneNumber: formattedPhoneNumber },
    });

    return messageHistoryResult;
  }
}
