import { Segment } from 'src/segment/domain/segment';
import { CreateSegmentDto } from './dto/create-segment.dto';
import { UpdateSegmentQueryDto } from './dto/update-segment.dto';

export interface ISegmentUseCase {
  createUserQuery(createSegmentDto: CreateSegmentDto): Promise<Segment>;
  getSegmentDetails(segmentId: number): Promise<Segment>;
  updateSegmentQuery(
    updateSegmentQueryDto: UpdateSegmentQueryDto,
  ): Promise<Segment>;
  excuteSegmentQuery(segmentId: number): Promise<any>;
  // getSegmentName(segmentId: number): Promise<any>;
}

export const ISegmentUseCaseSymbol = Symbol('ISegmentUseCaseSymbol');
