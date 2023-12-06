import { SegmentOrmEntity } from 'src/segment/adapter/out-persistence/segment.orm.entity';
import { Segment } from 'src/segment/domain/segment';

export interface ISegmentPort {
  saveSegmentToEfficDB(segment: Segment): Promise<SegmentOrmEntity>;
  updateSegmentQuery(segmentId: number, segmentQuery: string): Promise<Segment>;
  getSegmentDetails(segmentId: number): Promise<Segment>;
  getSegmentNames(): Promise<string[]>;
}

export const ISegmentPortSymbol = Symbol('ISegmentPortSymbol');
