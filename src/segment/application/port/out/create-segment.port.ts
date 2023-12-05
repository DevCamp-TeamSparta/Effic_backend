import { Segment } from 'src/segment/domain/segment';

export interface ICreateSegmentPort {
  saveSegmentToEfficDB(segment: Segment): Promise<Segment>;
  // getUserQueryFromEfficDB(uuid: string): Promise<UserQuery>;
}

export const ICreateSegmentPortSymbol = Symbol('ICreateSegmentPortSymbol');
