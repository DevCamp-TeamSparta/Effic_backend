import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SegmentOrmEntity } from './segment.orm.entity';
import { Segment } from 'src/segment/domain/segment';
import { SegmentMapper } from './segment.mapper';
import { ISegmentPort } from 'src/segment/application/port/out/segment.port';

@Injectable()
export class SegmentRepository implements ISegmentPort {
  constructor(
    @InjectRepository(SegmentOrmEntity)
    private readonly segmentRepository: Repository<SegmentOrmEntity>,
  ) {}

  async saveSegmentToEfficDB(segment: Segment): Promise<SegmentOrmEntity> {
    const segmentOrmEntity = SegmentMapper.mapToSegmentOrmEntity(segment);

    const savedSegmentOrmEntity = await this.segmentRepository.save(
      segmentOrmEntity,
    );
    return savedSegmentOrmEntity;
  }

  async getSegmentDetails(segmentId: number): Promise<Segment> {
    const segmentOrmEntity = await this.segmentRepository.findOneBy({
      id: segmentId,
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
      id: segmentId,
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
      id: segment.id,
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
}
