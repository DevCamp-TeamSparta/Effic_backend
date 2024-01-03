import { Segment } from 'src/segment/domain/segment';
import { CreateSegmentDto } from './dto/create-segment.dto';
import { UpdateSegmentQueryDto } from './dto/update-segment-query.dto';
import { GetSegmentDetailsDto } from './dto/get-segment-details.dto';
import { CreateFilterQueryByVariableValueDto } from './dto/create-filter-query-by-variable-value.dto';
import { CreateFilterQueryByFatigueLevelDto } from './dto/create-filter-query-by-fatigue-level.dto';
import { SegmentOrmEntity } from 'src/segment/adapter/out-persistence/segment.orm.entity';
import { UpdateSegmentDto } from './dto/update-segment.dto';
import { UpdateClientDbDto } from './dto/update-client-db.dto';

export interface ISegmentUseCase {
  createSegment(createSegmentDto: CreateSegmentDto): Promise<SegmentOrmEntity>;
  getSegmentDetails(
    segmentId: number,
    email: string,
  ): Promise<SegmentOrmEntity>;
  updateSegment(dto: UpdateSegmentDto): Promise<SegmentOrmEntity>;
  updateSegmentQuery(
    updateSegmentQueryDto: UpdateSegmentQueryDto,
  ): Promise<Segment>;
  excuteSegmentQuery(segmentId: number, email: string): Promise<any>;
  getAllSegments(email: string): Promise<SegmentOrmEntity[]>;
  getSegmentTables(getSegmentDetailsDto: GetSegmentDetailsDto): Promise<any>;
  getSegmentColumns(getSegmentDetailsDto: GetSegmentDetailsDto): Promise<any>;

  createFilterQueryWhenNoFilter(
    segmentId: number,
    email: string,
  ): Promise<void>;
  createFilterQueryByVariableValue(
    createFilterQueryDto: CreateFilterQueryByVariableValueDto,
  ): Promise<any>;
  createFilterQueryByFatigueLevel(
    dto: CreateFilterQueryByFatigueLevelDto,
  ): Promise<any>;

  checkUserIsSegmentCreator(
    email: string,
    segmentId: number,
  ): Promise<SegmentOrmEntity>;
}

export const ISegmentUseCaseSymbol = Symbol('ISegmentUseCaseSymbol');
