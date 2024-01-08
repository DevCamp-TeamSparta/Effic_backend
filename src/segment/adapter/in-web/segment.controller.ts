import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Inject,
  Logger,
  ParseIntPipe,
  Post,
  Put,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { AccessTokenGuard } from 'src/auth/guards/auth.guard';
import { CreateFilterQueryByFatigueLevelDto } from 'src/segment/application/port/in/dto/create-filter-query-by-fatigue-level.dto';
import { CreateFilterQueryByVariableValueDto } from 'src/segment/application/port/in/dto/create-filter-query-by-variable-value.dto';
import { CreateSegmentDto } from 'src/segment/application/port/in/dto/create-segment.dto';
import { GetSegmentDetailsDto } from 'src/segment/application/port/in/dto/get-segment-details.dto';
import { UpdateSegmentQueryDto } from 'src/segment/application/port/in/dto/update-segment-query.dto';
import {
  ISegmentUseCase,
  ISegmentUseCaseSymbol,
} from 'src/segment/application/port/in/segment.use-case';
import { SegmentOrmEntity } from '../out-persistence/segment.orm.entity';
import { UpdateSegmentDto } from 'src/segment/application/port/in/dto/update-segment.dto';
import {
  ApiBody,
  ApiCreatedResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';

@Controller('segment')
@ApiTags('Segment API')
export class SegmentController {
  private logger = new Logger('SegmentController');
  constructor(
    @Inject(ISegmentUseCaseSymbol)
    private readonly segmentUseCase: ISegmentUseCase,
  ) {}

  @UseGuards(AccessTokenGuard)
  @Post()
  @ApiOperation({
    summary: 'Segment 생성 API',
    description: 'Segment를 생성함',
  })
  @ApiCreatedResponse({
    description: '생성된 Segment를 반환',
    type: SegmentOrmEntity,
  })
  @HttpCode(HttpStatus.CREATED)
  async createSegment(@Req() req, @Body() dto: CreateSegmentDto) {
    this.logger.verbose('createSegment');
    dto.email = req.payload.email;
    return this.segmentUseCase.createSegment(dto);
  }

  @UseGuards(AccessTokenGuard)
  @Put()
  @HttpCode(HttpStatus.CREATED)
  async updateSegment(@Req() req, @Body() dto: UpdateSegmentDto) {
    this.logger.verbose('updateSegment');
    dto.email = req.payload.email;
    return this.segmentUseCase.updateSegment(dto);
  }

  @UseGuards(AccessTokenGuard)
  @Get('/detail')
  async getSegmentDetails(
    @Req() req,
    @Query('segmentId', ParseIntPipe) segmentId: number,
  ): Promise<SegmentOrmEntity> {
    this.logger.verbose('getSegmentDetails');
    const email = req.payload.email;
    return this.segmentUseCase.getSegmentDetails(segmentId, email);
  }

  @UseGuards(AccessTokenGuard)
  @Delete()
  @ApiOperation({
    summary: 'Segment 삭제 API',
    description: 'Segment를 삭제함',
  })
  @ApiCreatedResponse({
    description: '삭제한 Segment를 반환',
    type: SegmentOrmEntity,
  })
  @HttpCode(HttpStatus.OK)
  async deleteSegment(
    @Req() req,
    @Query('segmentId', ParseIntPipe) segmentId: number,
  ) {
    this.logger.verbose('deleteSegment');
    const email = req.payload.email;
    return this.segmentUseCase.deleteSegment(segmentId, email);
  }

  @UseGuards(AccessTokenGuard)
  @Get('/date-column')
  async getSegmentDateColumn(
    @Req() req,
    @Query('segmentId', ParseIntPipe) segmentId: number,
  ): Promise<SegmentOrmEntity> {
    this.logger.verbose('getSegmentDateColumn');
    const email = req.payload.email;
    return this.segmentUseCase.getSegmentDateColumn(segmentId, email);
  }

  @UseGuards(AccessTokenGuard)
  @Put('/query')
  @HttpCode(HttpStatus.CREATED)
  async updateSegmentQuery(@Req() req, @Body() dto: UpdateSegmentQueryDto) {
    this.logger.verbose('updateSegmentQuery');
    dto.email = req.payload.email;
    return this.segmentUseCase.updateSegmentQuery(dto);
  }

  @UseGuards(AccessTokenGuard)
  @Post('/query')
  @HttpCode(HttpStatus.OK)
  async excuteSegmentQuery(
    @Req() req,
    @Body('segmentId', ParseIntPipe) segmentId: number,
  ): Promise<any> {
    this.logger.verbose('excuteSegmentQuery');
    const email = req.payload.email;
    return this.segmentUseCase.excuteSegmentQuery(segmentId, email);
  }

  @UseGuards(AccessTokenGuard)
  @Get('/all')
  @HttpCode(HttpStatus.OK)
  async getAllSegments(@Req() req): Promise<SegmentOrmEntity[]> {
    this.logger.verbose('getAllSegments');
    const email = req.payload.email;
    return this.segmentUseCase.getAllSegments(email);
  }

  @Post('/tables')
  @ApiOperation({
    summary: '테이블명 조회',
    description: 'DB의 테이블명을 조회',
  })
  @ApiCreatedResponse({
    description: 'DB의 테이블명을 반환',
  })
  @ApiBody({
    description: 'DB 이름',
    type: GetSegmentDetailsDto,
    examples: {
      example1: {
        value: {
          databaseName: 'warehouse',
        },
      },
    },
  })
  @HttpCode(HttpStatus.OK)
  async getSegmentTables(@Body() dto: GetSegmentDetailsDto) {
    this.logger.verbose('getSegmentTables');
    return this.segmentUseCase.getSegmentTables(dto);
  }

  @Post('/columns')
  @ApiOperation({
    summary: '컬럼명 조회',
    description: '테이블의 컬럼명을 조회',
  })
  @ApiCreatedResponse({
    description: '테이블의 컬럼명을 반환',
  })
  @ApiBody({
    description: '테이블명',
    type: GetSegmentDetailsDto,
    examples: {
      example1: {
        value: {
          tableName: 'dbchang_users',
        },
      },
    },
  })
  @HttpCode(HttpStatus.OK)
  async getSegmentColumns(@Body() dto: GetSegmentDetailsDto) {
    this.logger.verbose('getSegmentColumns');
    return this.segmentUseCase.getSegmentColumns(dto);
  }

  @UseGuards(AccessTokenGuard)
  @Post('/filter-query/no-filter')
  @HttpCode(HttpStatus.CREATED)
  async createFilterQueryWhenNoFilter(
    @Req() req,
    @Body('segmentId', ParseIntPipe) segmentId: number,
  ): Promise<void> {
    this.logger.verbose('createFilterQueryWhenNoFilter');
    const email = req.payload.email;
    return this.segmentUseCase.createFilterQueryWhenNoFilter(segmentId, email);
  }

  @UseGuards(AccessTokenGuard)
  @Post('/filter-query/variable-value')
  @HttpCode(HttpStatus.CREATED)
  async createFilterQueryByVariableValue(
    @Req() req,
    @Body() dto: CreateFilterQueryByVariableValueDto,
  ): Promise<void> {
    this.logger.verbose('createFilterQueryByVariableValue');
    dto.email = req.payload.email;
    return this.segmentUseCase.createFilterQueryByVariableValue(dto);
  }

  @UseGuards(AccessTokenGuard)
  @Post('/filter-query/fatigue-level')
  @HttpCode(HttpStatus.CREATED)
  async createFilterQueryByFatigueLevel(
    @Req() req,
    @Body() dto: CreateFilterQueryByFatigueLevelDto,
  ): Promise<void> {
    this.logger.verbose('createFilterQueryByFatigueLevel');
    dto.email = req.payload.email;
    return this.segmentUseCase.createFilterQueryByFatigueLevel(dto);
  }

  @UseGuards(AccessTokenGuard)
  @ApiOperation({
    summary: '필터링 취소 API',
    description: 'Filter Query를 Segment Query로 덮어씀',
  })
  @Delete('/filter-query')
  @HttpCode(HttpStatus.OK)
  async deleteFilterQuery(
    @Req() req,
    @Body('segmentId', ParseIntPipe) segmentId: number,
  ): Promise<void> {
    this.logger.verbose('deleteFilterQuery');
    const email = req.payload.email;
    return this.segmentUseCase.deleteFilterQuery(segmentId, email);
  }
}
