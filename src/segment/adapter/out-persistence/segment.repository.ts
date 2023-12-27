import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SegmentOrmEntity } from './segment.orm.entity';
import { Segment } from 'src/segment/domain/segment';
import { SegmentMapper } from './segment.mapper';
import { ISegmentPort } from 'src/segment/application/port/out/segment.port';
import { MessageHistoryOrmEntity } from './message-history.orm.entity';

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

  async getSegmentDetails(segmentId: number): Promise<Segment> {
    const segmentOrmEntity = await this.segmentRepository.findOneBy({
      segmentId,
    });
    if (!segmentOrmEntity) throw new Error('Segment not found');

    const segment = SegmentMapper.mapToUserQuery(segmentOrmEntity);

    return segment;
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

  /** To do: user 기능과 연결 필요 */
  async getSegmentNames(): Promise<{ id: number; name: string }[]> {
    const segments = await this.segmentRepository.find();

    const segmentIdandNames = segments.map((segment) => ({
      id: segment.segmentId,
      name: segment.segmentName,
    }));

    return segmentIdandNames;
  }

  async getSegmentColumn(columnName: string): Promise<any[]> {
    const result = await this.segmentRepository
      .createQueryBuilder('segment')
      .select(`segment.${columnName}`)
      .addSelect('segment.id')
      .getRawMany();

    // console.log(result);

    return result;
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
