import { Segment } from 'src/segment/domain/segment';
import { CreateSegmentDto } from './dto/create-segment.dto';
import { UpdateSegmentQueryDto } from './dto/update-segment.dto';
import { GetSegmentDetailsDto } from './dto/get-segment-details.dto';
import { CreateFilterQueryByVariableValueDto } from './dto/create-filter-query-by-variable-value.dto';
import { CreateFilterQueryByFatigueLevelDto } from './dto/create-filter-query-by-fatigue-level.dto';

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
  createFilterQueryByVariableValue(
    createFilterQueryDto: CreateFilterQueryByVariableValueDto,
  ): Promise<any>;
  createFilterQueryByFatigueLevel(
    dto: CreateFilterQueryByFatigueLevelDto,
  ): Promise<any>;
}

export const ISegmentUseCaseSymbol = Symbol('ISegmentUseCaseSymbol');
