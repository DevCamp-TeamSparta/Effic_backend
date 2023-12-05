import { SegmentOrmEntity } from 'src/segment/adapter/out-persistence/segment.orm.entity';
import { Segment } from 'src/segment/domain/segment';

export interface ICreateSegmentPort {
  saveSegmentToEfficDB(segment: Segment): Promise<SegmentOrmEntity>;
  // updateSegmentQuery(segmentId: number, segmentQuery: string): Promise<void>;
  getSegmentDetails(segmentId: number): Promise<Segment>;
}

export const ICreateSegmentPortSymbol = Symbol('ICreateSegmentPortSymbol');
