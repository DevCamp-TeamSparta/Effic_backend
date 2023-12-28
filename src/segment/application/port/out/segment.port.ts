import { MessageHistoryOrmEntity } from 'src/segment/adapter/out-persistence/message-history.orm.entity';
import { SegmentOrmEntity } from 'src/segment/adapter/out-persistence/segment.orm.entity';
import { Segment } from 'src/segment/domain/segment';

export interface ISegmentPort {
  saveSegment(segment: Segment, userId: number): Promise<SegmentOrmEntity>;
  getSegmentDetails(segmentId: number): Promise<SegmentOrmEntity>;
  updateSegmentQuery(segmentId: number, segmentQuery: string): Promise<Segment>;
  getAllSegments(userId: number): Promise<Segment[]>;
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
