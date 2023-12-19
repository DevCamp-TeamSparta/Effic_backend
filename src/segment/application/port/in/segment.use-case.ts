import { Segment } from 'src/segment/domain/segment';
import { CreateSegmentDto } from './dto/create-segment.dto';
import { UpdateSegmentQueryDto } from './dto/update-segment.dto';
import { GetSegmentDetailsDto } from './dto/get-segment-details.dto';

export interface ISegmentUseCase {
  createUserQuery(createSegmentDto: CreateSegmentDto): Promise<Segment>;
  getSegmentDetails(segmentId: number): Promise<Segment>;
  updateSegmentQuery(
    updateSegmentQueryDto: UpdateSegmentQueryDto,
  ): Promise<Segment>;
  excuteSegmentQuery(segmentId: number): Promise<any>;
  getSegmentNames(): Promise<{ id: number; name: string }[]>;
  getSegmentColumn(columnName: string): Promise<any>;
  getSegmentRecords(getSegmentDetailsDto: GetSegmentDetailsDto): Promise<any>;
  getSegmentTables(getSegmentDetailsDto: GetSegmentDetailsDto): Promise<any>;
  getSegmentColumns(getSegmentDetailsDto: GetSegmentDetailsDto): Promise<any>;
  createFilterQueryWhenNoFilter(segmentId: number): Promise<void>;
}

export const ISegmentUseCaseSymbol = Symbol('ISegmentUseCaseSymbol');
