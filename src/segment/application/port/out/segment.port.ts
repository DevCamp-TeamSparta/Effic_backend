import { MessageHistoryOrmEntity } from 'src/segment/adapter/out-persistence/message-history.orm.entity';
import { SegmentOrmEntity } from 'src/segment/adapter/out-persistence/segment.orm.entity';
import { Segment } from 'src/segment/domain/segment';

export interface ISegmentPort {
  saveSegmentToEfficDB(segment: Segment): Promise<SegmentOrmEntity>;
  updateSegmentQuery(segmentId: number, segmentQuery: string): Promise<Segment>;
  getSegmentDetails(segmentId: number): Promise<Segment>;
  getSegmentNames(): Promise<{ id: number; name: string }[]>;
  getSegmentColumn(columnName: string): Promise<any[]>;
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
