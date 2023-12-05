import { Body, Controller, Get, Inject, Post, Put } from '@nestjs/common';
import { CreateSegmentDto } from 'src/segment/application/port/in/dto/create-segment.dto';
import {
  ISegmentUseCase,
  ISegmentUseCaseSymbol,
} from 'src/segment/application/port/in/segment.use-case';
import { Segment } from 'src/segment/domain/segment';

@Controller('segment')
export class SegmentController {
  constructor(
    @Inject(ISegmentUseCaseSymbol)
    private readonly segmentUseCase: ISegmentUseCase,
  ) {}

  @Post()
  async createSegment(@Body() dto: CreateSegmentDto) {
    return this.segmentUseCase.createUserQuery(dto);
  }

  @Get('/detail')
  async getSegmentDetails(
    @Body('segmentId') segmentId: number,
  ): Promise<Segment> {
    return this.segmentUseCase.getSegmentDetails(segmentId);
  }

  // @Put()
  // async updateSegmentQuery(@Body() dto: updateSegmentQueryDto) {
  //   return this.segmentUseCase.updateSegmentQuery(dto);
  // }

  // @Get()
  // async getSegment(@Body('uuid') uuid: string) {
  //   console.log(uuid);
  //   return this.createUserQueryUseCase.getUserQuery(uuid);
  // }
}
