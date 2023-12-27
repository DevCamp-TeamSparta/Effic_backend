import { Segment } from 'src/segment/domain/segment';
import { SegmentOrmEntity } from './segment.orm.entity';

export class SegmentMapper {
  static mapToUserQuery(segment: SegmentOrmEntity) {
    const SegmentEntity = new Segment(
      segment.segmentName,
      segment.segmentDescription,
      segment.createdAt,
      segment.updatedAt,
      segment.segmentQuery,
      segment.filterQuery,
    );
    return SegmentEntity;
  }

  static mapToSegmentOrmEntity(segment: Segment, userId: number) {
    const segmentEntity = new SegmentOrmEntity();
    segmentEntity.segmentName = segment.segmentName;
    segmentEntity.segmentDescription = segment.segmentDescription;
    segmentEntity.segmentQuery = segment.segmentQuery;
    segmentEntity.filterQuery = segment.filterQuery;
    segmentEntity.createdAt = segment.createdAt;
    segmentEntity.userId = userId;

    return segmentEntity;
  }
}
