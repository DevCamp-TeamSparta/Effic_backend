import { Body, Controller, Get, Inject, Post } from '@nestjs/common';
import { CreateSegmentDto } from 'src/segment/application/port/in/dto/create-segment.dto';
import {
  ISegmentUseCase,
  ISegmentUseCaseSymbol,
} from 'src/segment/application/port/in/segment.use-case';

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

  // @Get()
  // async getSegment(@Body('uuid') uuid: string) {
  //   console.log(uuid);
  //   return this.createUserQueryUseCase.getUserQuery(uuid);
  // }
}
