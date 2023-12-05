import { Inject, Injectable } from '@nestjs/common';
import { ISegmentUseCase } from '../port/in/segment.use-case';
import {
  ICreateSegmentPort,
  ICreateSegmentPortSymbol,
} from '../port/out/create-segment.port';
import { CreateSegmentDto } from '../port/in/dto/create-segment.dto';
import { Segment } from 'src/segment/domain/segment';

@Injectable()
export class SegmentService implements ISegmentUseCase {
  constructor(
    @Inject(ICreateSegmentPortSymbol)
    private readonly createSegmentPort: ICreateSegmentPort,
  ) {}

  async createUserQuery(dto: CreateSegmentDto): Promise<any> {
    const { segmentName, segmentDescription } = dto;
    const newSegment = new Segment(segmentName, segmentDescription, null);
    return this.createSegmentPort.saveSegmentToEfficDB(newSegment);
  }

  // async getUserQuery(uuid: string): Promise<UserQuery> {
  //   return this.createUserQueryPort.getUserQueryFromEfficDB(uuid);
  // }
}
