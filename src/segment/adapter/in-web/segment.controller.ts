import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Inject,
  Logger,
  ParseIntPipe,
  Post,
  Put,
  Req,
  UseGuards,
} from '@nestjs/common';
import { AccessTokenGuard } from 'src/auth/guards/auth.guard';
import { CreateFilterQueryByFatigueLevelDto } from 'src/segment/application/port/in/dto/create-filter-query-by-fatigue-level.dto';
import { CreateFilterQueryByVariableValueDto } from 'src/segment/application/port/in/dto/create-filter-query-by-variable-value.dto';
import { CreateSegmentDto } from 'src/segment/application/port/in/dto/create-segment.dto';
import { GetSegmentColumnDto } from 'src/segment/application/port/in/dto/get-segment-column.dto';
import { GetSegmentDetailsDto } from 'src/segment/application/port/in/dto/get-segment-details.dto';
import { UpdateSegmentQueryDto } from 'src/segment/application/port/in/dto/update-segment-query.dto';
import {
  ISegmentUseCase,
  ISegmentUseCaseSymbol,
} from 'src/segment/application/port/in/segment.use-case';
import { Segment } from 'src/segment/domain/segment';
import { SegmentOrmEntity } from '../out-persistence/segment.orm.entity';

@Controller('segment')
export class SegmentController {
  private logger = new Logger('SegmentController');
  constructor(
    @Inject(ISegmentUseCaseSymbol)
    private readonly segmentUseCase: ISegmentUseCase,
  ) {}

  @UseGuards(AccessTokenGuard)
  @Post()
  @HttpCode(HttpStatus.CREATED)
  async createSegment(@Req() req, @Body() dto: CreateSegmentDto) {
    this.logger.verbose('createSegment');
    dto.email = req.payload.email;
    return this.segmentUseCase.createSegment(dto);
  }

  @UseGuards(AccessTokenGuard)
  @Post('/detail')
  async getSegmentDetails(
    @Req() req,
    @Body('segmentId', ParseIntPipe) segmentId: number,
  ): Promise<SegmentOrmEntity> {
    this.logger.verbose('getSegmentDetails');
    const email = req.payload.email;
    return this.segmentUseCase.getSegmentDetails(segmentId, email);
  }

  @UseGuards(AccessTokenGuard)
  @Put('/query')
  @HttpCode(HttpStatus.CREATED)
  async updateSegmentQuery(@Req() req, @Body() dto: UpdateSegmentQueryDto) {
    this.logger.verbose('updateSegmentQuery');
    dto.email = req.payload.email;
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
  async getSegmentColumn(@Body() dto: GetSegmentColumnDto) {
    return this.segmentUseCase.getSegmentColumn(dto);
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
    @Body('segmentId', ParseIntPipe) segmentId: number,
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
