import { Segment } from 'src/segment/domain/segment';
import { CreateSegmentDto } from './dto/create-segment.dto';
import { UpdateSegmentQueryDto } from './dto/update-segment.dto';
import { GetSegmentRecordsDto } from './dto/get-segment-records.dto';

export interface ISegmentUseCase {
  createUserQuery(createSegmentDto: CreateSegmentDto): Promise<Segment>;
  getSegmentDetails(segmentId: number): Promise<Segment>;
  updateSegmentQuery(
    updateSegmentQueryDto: UpdateSegmentQueryDto,
  ): Promise<Segment>;
  excuteSegmentQuery(segmentId: number): Promise<any>;
  getSegmentNames(): Promise<string[]>;
  getSegmentColumn(columnName: string): Promise<any>;
  getSegmentRecords(getSegmentRecordsDto: GetSegmentRecordsDto): Promise<any>;
}

export const ISegmentUseCaseSymbol = Symbol('ISegmentUseCaseSymbol');
