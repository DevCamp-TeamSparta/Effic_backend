import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Inject,
  ParseIntPipe,
  Post,
  Put,
} from '@nestjs/common';
import { CreateFilterQueryByFatigueLevelDto } from 'src/segment/application/port/in/dto/create-filter-query-by-fatigue-level.dto';
import { CreateFilterQueryByVariableValueDto } from 'src/segment/application/port/in/dto/create-filter-query-by-variable-value.dto';
import { CreateSegmentDto } from 'src/segment/application/port/in/dto/create-segment.dto';
import { GetSegmentDetailsDto } from 'src/segment/application/port/in/dto/get-segment-details.dto';
import { UpdateSegmentQueryDto } from 'src/segment/application/port/in/dto/update-segment-query.dto';
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
  @HttpCode(HttpStatus.CREATED)
  async createSegment(@Body() dto: CreateSegmentDto) {
    return this.segmentUseCase.createSegment(dto);
  }

  @Post('/detail')
  async getSegmentDetails(
    @Body('segmentId', ParseIntPipe) segmentId: number,
  ): Promise<Segment> {
    return this.segmentUseCase.getSegmentDetails(segmentId);
  }

  @Put('/query')
  @HttpCode(HttpStatus.CREATED)
  async updateSegmentQuery(@Body() dto: UpdateSegmentQueryDto) {
    return this.segmentUseCase.updateSegmentQuery(dto);
  }

  @Post('/query')
  @HttpCode(HttpStatus.OK)
  async excuteSegmentQuery(
    @Body('segmentId', ParseIntPipe) segmentId: number,
  ): Promise<any> {
    return this.segmentUseCase.excuteSegmentQuery(segmentId);
  }

  /** To do: userId에 해당하는 segment의 segmentName을 return하도록 수정 */
  @Get('/segmentNames')
  @HttpCode(HttpStatus.OK)
  async getSegmentNames() {
    return this.segmentUseCase.getSegmentNames();
  }

  @Post('/column')
  @HttpCode(HttpStatus.OK)
  async getSegmentColumn(@Body('columnName') columnName: string) {
    return this.segmentUseCase.getSegmentColumn(columnName);
  }

  @Post('/records')
  @HttpCode(HttpStatus.OK)
  async getSegmentRecords(@Body() dto: GetSegmentDetailsDto) {
    return this.segmentUseCase.getSegmentRecords(dto);
  }

  @Post('/tables')
  @HttpCode(HttpStatus.OK)
  async getSegmentTables(@Body() dto: GetSegmentDetailsDto) {
    return this.segmentUseCase.getSegmentTables(dto);
  }

  @Post('/columns')
  @HttpCode(HttpStatus.OK)
  async getSegmentColumns(@Body() dto: GetSegmentDetailsDto) {
    return this.segmentUseCase.getSegmentColumns(dto);
  }

  @Post('/filter-query/no-filter')
  @HttpCode(HttpStatus.CREATED)
  async createFilterQueryWhenNoFilter(
    @Body('segmentId') segmentId: number,
  ): Promise<void> {
    return this.segmentUseCase.createFilterQueryWhenNoFilter(segmentId);
  }

  @Post('/filter-query/variable-value')
  @HttpCode(HttpStatus.CREATED)
  async createFilterQueryByVariableValue(
    @Body() dto: CreateFilterQueryByVariableValueDto,
  ): Promise<void> {
    return this.segmentUseCase.createFilterQueryByVariableValue(dto);
  }

  @Post('/filter-query/fatigue-level')
  @HttpCode(HttpStatus.CREATED)
  async createFilterQueryByFatigueLevel(
    @Body() dto: CreateFilterQueryByFatigueLevelDto,
  ): Promise<void> {
    return this.segmentUseCase.createFilterQueryByFatigueLevel(dto);
  }
}
