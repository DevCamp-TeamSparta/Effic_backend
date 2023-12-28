import { Segment } from 'src/segment/domain/segment';
import { CreateSegmentDto } from './dto/create-segment.dto';
import { UpdateSegmentQueryDto } from './dto/update-segment-query.dto';
import { GetSegmentDetailsDto } from './dto/get-segment-details.dto';
import { CreateFilterQueryByVariableValueDto } from './dto/create-filter-query-by-variable-value.dto';
import { CreateFilterQueryByFatigueLevelDto } from './dto/create-filter-query-by-fatigue-level.dto';
import { GetSegmentColumnDto } from './dto/get-segment-column.dto';
import { SegmentOrmEntity } from 'src/segment/adapter/out-persistence/segment.orm.entity';

export interface ISegmentUseCase {
  createSegment(createSegmentDto: CreateSegmentDto): Promise<SegmentOrmEntity>;
  getSegmentDetails(
    segmentId: number,
    email: string,
  ): Promise<SegmentOrmEntity>;
  updateSegmentQuery(
    updateSegmentQueryDto: UpdateSegmentQueryDto,
  ): Promise<Segment>;
  excuteSegmentQuery(segmentId: number, email: string): Promise<any>;
  getSegmentNames(): Promise<{ id: number; name: string }[]>;
  getSegmentColumn(dto: GetSegmentColumnDto);
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
