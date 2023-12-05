import { Inject, Injectable } from '@nestjs/common';
import { ISegmentUseCase } from '../port/in/segment.use-case';
import { ISegmentPort, ISegmentPortSymbol } from '../port/out/segment.port';
import { CreateSegmentDto } from '../port/in/dto/create-segment.dto';
import { Segment } from 'src/segment/domain/segment';
import { UpdateSegmentQueryDto } from '../port/in/dto/update-segment.dto';

@Injectable()
export class SegmentService implements ISegmentUseCase {
  constructor(
    @Inject(ISegmentPortSymbol)
    private readonly segmentPort: ISegmentPort,
  ) {}

  async createUserQuery(dto: CreateSegmentDto): Promise<any> {
    const { segmentName, segmentDescription } = dto;
    const newSegment = new Segment(segmentName, segmentDescription, null);
    return this.segmentPort.saveSegmentToEfficDB(newSegment);
  }

  async getSegmentDetails(segmentId: number): Promise<Segment> {
    const segmentDetails = this.segmentPort.getSegmentDetails(segmentId);
    return segmentDetails;
  }

  async updateSegmentQuery(dto: UpdateSegmentQueryDto): Promise<Segment> {
    const { segmentId, segmentQuery } = dto;
    const segment = await this.segmentPort.getSegmentDetails(segmentId);
    if (!segment) throw new Error('Segment not found');

    segment.updateSegmentQuery(segmentQuery);

    await this.segmentPort.saveSegmentToEfficDB(segment);

    return segment;
  }
}
