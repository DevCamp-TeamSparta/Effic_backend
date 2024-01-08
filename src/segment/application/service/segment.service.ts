import {
  BadRequestException,
  HttpException,
  HttpStatus,
  Inject,
  Injectable,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import { ISegmentUseCase } from '../port/in/segment.use-case';
import { ISegmentPort, ISegmentPortSymbol } from '../port/out/segment.port';
import { CreateSegmentDto } from '../port/in/dto/create-segment.dto';
import { Segment } from 'src/segment/domain/segment';
import { UpdateSegmentQueryDto } from '../port/in/dto/update-segment-query.dto';
import {
  IClientDbService,
  IClientDbServiceSymbol,
} from 'src/client-db/client-db.interface';
import { GetSegmentDetailsDto } from '../port/in/dto/get-segment-details.dto';
import { CreateFilterQueryByVariableValueDto } from '../port/in/dto/create-filter-query-by-variable-value.dto';
import { CreateFilterQueryByFatigueLevelDto } from '../port/in/dto/create-filter-query-by-fatigue-level.dto';
import { UsersService } from 'src/users/service/users.service';
import { SegmentOrmEntity } from 'src/segment/adapter/out-persistence/segment.orm.entity';
import { UpdateSegmentDto } from '../port/in/dto/update-segment.dto';
import { UpdateClientDbDto } from '../port/in/dto/update-client-db.dto';

@Injectable()
export class SegmentService implements ISegmentUseCase {
  private logger = new Logger('SegmentService');
  constructor(
    @Inject(ISegmentPortSymbol)
    private readonly segmentPort: ISegmentPort,
    @Inject(IClientDbServiceSymbol)
    private readonly clientDbService: IClientDbService,
    private usersService: UsersService,
  ) {}

  async createSegment(dto: CreateSegmentDto): Promise<SegmentOrmEntity> {
    this.logger.verbose('createSegment');
    const { segmentName, segmentDescription, createdAt, email, clientDbId } =
      dto;
    const newSegment = new Segment(
      segmentName,
      segmentDescription,
      createdAt,
      null,
      null,
      null,
    );
    const user = await this.usersService.checkUserInfo(email);
    return this.segmentPort.saveSegment(newSegment, user.userId, clientDbId);
  }

  async updateSegment(dto: UpdateSegmentDto): Promise<SegmentOrmEntity> {
    this.logger.verbose('updateSegment');
    const { segmentId, email } = dto;

    await this.checkUserIsSegmentCreator(email, segmentId);

    const updatedAt = new Date();
    dto.updatedAt = updatedAt;

    return this.segmentPort.updateSegment(dto);
  }

  async getSegmentDetails(
    segmentId: number,
    email: string,
  ): Promise<SegmentOrmEntity> {
    this.logger.verbose('getSegmentDetails');

    const segmentDetails = await this.checkUserIsSegmentCreator(
      email,
      segmentId,
    );
    return segmentDetails;
  }

  async deleteSegment(
    segmentId: number,
    email: string,
  ): Promise<SegmentOrmEntity> {
    this.logger.verbose('deleteSegment');

    await this.checkUserIsSegmentCreator(email, segmentId);

    const segment = await this.segmentPort.deleteSegment(segmentId);

    return segment;
  }

  async getSegmentDateColumn(segmentId: number, email: string) {
    await this.checkUserIsSegmentCreator(email, segmentId);

    const segment = await this.segmentPort.getSegmentDetails(segmentId);

    const result = await this.clientDbService.executeQueryPg(
      segment.segmentQuery,
    );

    const dateColumns = [];

    const sampleRow = result[0];
    for (const key in sampleRow) {
      const value = sampleRow[key];
      if (value instanceof Date) dateColumns.push(key);
    }

    return dateColumns;
  }

  async updateSegmentQuery(dto: UpdateSegmentQueryDto): Promise<Segment> {
    this.logger.verbose('updateSegmentQuery');
    const { segmentId, email } = dto;

    await this.checkUserIsSegmentCreator(email, segmentId);

    const updatedAt = new Date();
    dto.updatedAt = updatedAt;

    return await this.segmentPort.updateSegmentQuery(dto);
  }

  async excuteSegmentQuery(segmentId: number, email: string) {
    this.logger.verbose('excuteSegmentQuery');
    await this.checkUserIsSegmentCreator(email, segmentId);

    const segment = await this.segmentPort.getSegmentDetails(segmentId);

    const result = await this.clientDbService.executeQueryPg(
      segment.segmentQuery,
    );
    return result;
  }

  async getAllSegments(email: string): Promise<SegmentOrmEntity[]> {
    this.logger.verbose('getAllSegments');
    const user = await this.usersService.checkUserInfo(email);
    return await this.segmentPort.getAllSegments(user.userId);
  }

  async getSegmentTables(dto: GetSegmentDetailsDto): Promise<any[]> {
    this.logger.verbose('getSegmentTables');
    const { databaseName } = dto;

    /**MySQL */
    // const queryMySQL = `SELECT table_name FROM information_schema.tables WHERE table_schema = '${databaseName}';`;

    const queryPg = `SELECT tablename FROM pg_tables WHERE schemaname = 'public';`;
    const result = await this.clientDbService.executeQueryPg(queryPg);

    return result.map((row) => row['tablename']);
  }

  async getSegmentColumns(dto: GetSegmentDetailsDto): Promise<string[]> {
    this.logger.verbose('getSegmentColumns');
    const { tableName } = dto;

    const query = `SELECT column_name FROM information_schema.columns WHERE table_name = '${tableName}';`;
    const result = await this.clientDbService.executeQueryPg(query);

    return result.map((row) => row['column_name']);
  }

  async createFilterQueryWhenNoFilter(
    segmentId: number,
    email: string,
  ): Promise<void> {
    this.logger.verbose('createFilterQueryWhenNoFilter');
    const segment = await this.checkUserIsSegmentCreator(email, segmentId);

    if (!segment.segmentQuery)
      throw new BadRequestException(
        'Segment 테이블에 SegmentQuery가 존재하지 않음',
      );

    if (segment.filterQuery)
      throw new HttpException(
        'Filter Query가 이미 존재합니다.',
        HttpStatus.BAD_REQUEST,
      );
    await this.segmentPort.updateFilterQuery(segmentId, segment.segmentQuery);

    return;
  }

  async deleteFilterQuery(segmentId: number, email: string): Promise<void> {
    this.logger.verbose('deleteFilterQuery');
    const segment = await this.checkUserIsSegmentCreator(email, segmentId);

    if (!segment.segmentQuery)
      throw new BadRequestException('Segment Query does not exists');

    if (!segment.filterQuery)
      throw new BadRequestException('Filter Query does not exists');

    // segmentQuery로 filterQuery 덮어쓰기
    await this.segmentPort.updateFilterQuery(segmentId, segment.segmentQuery);

    return;
  }

  async createFilterQueryByVariableValue(
    dto: CreateFilterQueryByVariableValueDto,
  ): Promise<any> {
    this.logger.verbose('createFilterQueryByVariableValue');
    const { segmentId, columnName, value, excludeValue, email } = dto;

    const segment = await this.checkUserIsSegmentCreator(email, segmentId);

    let modifiedQuery = segment.filterQuery.trim();
    if (modifiedQuery.endsWith(';')) {
      modifiedQuery = modifiedQuery.slice(0, -1);
    }

    const hasWhereClause = modifiedQuery.toUpperCase().includes(' WHERE ');

    const condition = excludeValue
      ? `${columnName} NOT LIKE '%${value}%'`
      : `${columnName} LIKE '%${value}%'`;

    if (hasWhereClause) {
      modifiedQuery += ` AND ${condition}`;
    } else {
      modifiedQuery += ` WHERE ${condition}`;
    }

    modifiedQuery += ';';

    await this.segmentPort.updateFilterQuery(segmentId, modifiedQuery);

    const modifiedQueryResult = await this.clientDbService.executeQueryPg(
      modifiedQuery,
    );

    return {
      modifiedQuery,
      modifiedQueryResult,
    };
  }

  async createFilterQueryByFatigueLevel(
    dto: CreateFilterQueryByFatigueLevelDto,
  ): Promise<void> {
    this.logger.verbose('createFilterQueryByFatigueLevel');
    const { segmentId, receiverNumberColumnName, fatigueLevelDays, email } =
      dto;

    const segment = await this.checkUserIsSegmentCreator(email, segmentId);

    const queryResult = await this.clientDbService.executeQueryPg(
      segment.filterQuery,
    );
    const phoneNumbers = queryResult.map(
      (row) => row[receiverNumberColumnName],
    );

    const excludePhoneNumbers = [];
    const currentDate = new Date();

    for (const phoneNumber of phoneNumbers) {
      const messageHistoryResults =
        await this.segmentPort.getMessageHistoryByPhoneNumber(phoneNumber);

      for (const messageHistory of messageHistoryResults) {
        const deliveredAt = new Date(messageHistory.deliveredAt);
        if (
          currentDate.getTime() - deliveredAt.getTime() <
          fatigueLevelDays * 24 * 60 * 60 * 1000
        ) {
          excludePhoneNumbers.push(phoneNumber);
          break;
        }
      }
    }

    let modifiedQuery = segment.filterQuery.trim();
    if (modifiedQuery.endsWith(';')) {
      modifiedQuery = modifiedQuery.slice(0, -1);
    }

    const hasWhereClause = modifiedQuery.toUpperCase().includes(' WHERE ');

    if (excludePhoneNumbers.length > 0) {
      const exclusionCondition = excludePhoneNumbers
        .map((num) => `${receiverNumberColumnName} != '${num}'`)
        .join(' AND ');

      if (hasWhereClause) {
        modifiedQuery += ` AND (${exclusionCondition})`;
      } else {
        modifiedQuery += ` WHERE (${exclusionCondition})`;
      }
    }

    modifiedQuery += ';';

    await this.segmentPort.updateFilterQuery(segmentId, modifiedQuery);
  }

  async checkUserIsSegmentCreator(
    email: string,
    segmentId: number,
  ): Promise<SegmentOrmEntity> {
    const user = await this.usersService.checkUserInfo(email);
    const segmentDetails = await this.segmentPort.getSegmentDetails(segmentId);

    if (user.userId !== segmentDetails.userId)
      throw new UnauthorizedException();

    return segmentDetails;
  }
}
