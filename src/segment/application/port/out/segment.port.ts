import { MessageHistoryOrmEntity } from 'src/segment/adapter/out-persistence/message-history.orm.entity';
import { SegmentOrmEntity } from 'src/segment/adapter/out-persistence/segment.orm.entity';
import { Segment } from 'src/segment/domain/segment';
import { UpdateSegmentDto } from '../in/dto/update-segment.dto';
import { UpdateSegmentQueryDto } from '../in/dto/update-segment-query.dto';

export interface ISegmentPort {
  saveSegment(segment: Segment, userId: number): Promise<SegmentOrmEntity>;
  updateSegment(dto: UpdateSegmentDto): Promise<SegmentOrmEntity>;
  getSegmentDetails(segmentId: number): Promise<SegmentOrmEntity>;
  updateSegmentQuery(dto: UpdateSegmentQueryDto): Promise<Segment>;
  getAllSegments(userId: number): Promise<SegmentOrmEntity[]>;
  updateFilterQuery(segmentId: number, filterQuery: string): Promise<Segment>;
  saveMessageHistory(
    phoneNumber: string,
    content: string,
    deliveredAt: string,
  ): Promise<MessageHistoryOrmEntity>;
  getMessageHistoryByPhoneNumber(
    phoneNumber: string,
  ): Promise<MessageHistoryOrmEntity[]>;
}

export const ISegmentPortSymbol = Symbol('ISegmentPortSymbol');
