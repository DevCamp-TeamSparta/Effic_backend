import { Segment } from 'src/segment/domain/segment';
import { CreateSegmentDto } from './dto/create-segment.dto';

export interface ISegmentUseCase {
  createUserQuery(createSegmentDto: CreateSegmentDto): Promise<Segment>;
  // getUserQuery(uuid: string): Promise<Segment>;
}

export const ISegmentUseCaseSymbol = Symbol('ISegmentUseCaseSymbol');
