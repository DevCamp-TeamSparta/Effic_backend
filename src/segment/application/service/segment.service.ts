import { HttpException, HttpStatus, Inject, Injectable } from '@nestjs/common';
import { ISegmentUseCase } from '../port/in/segment.use-case';
import { ISegmentPort, ISegmentPortSymbol } from '../port/out/segment.port';
import { CreateSegmentDto } from '../port/in/dto/create-segment.dto';
import { Segment } from 'src/segment/domain/segment';
import { UpdateSegmentQueryDto } from '../port/in/dto/update-segment.dto';
import {
  IClientDbService,
  IClientDbServiceSymbol,
} from 'src/client-db/client-db.interface';
import { GetSegmentDetailsDto } from '../port/in/dto/get-segment-details.dto';
import { CreateFilterQueryDto } from '../port/in/dto/create-filter-query.dto';

@Injectable()
export class SegmentService implements ISegmentUseCase {
  constructor(
    @Inject(ISegmentPortSymbol)
    private readonly segmentPort: ISegmentPort,
    @Inject(IClientDbServiceSymbol)
    private readonly clientDbService: IClientDbService,
  ) {}

  async createUserQuery(dto: CreateSegmentDto): Promise<any> {
    const { segmentName, segmentDescription } = dto;
    const newSegment = new Segment(segmentName, segmentDescription, null, null);
    return this.segmentPort.saveSegmentToEfficDB(newSegment);
  }

  async getSegmentDetails(segmentId: number): Promise<Segment> {
    const segmentDetails = await this.segmentPort.getSegmentDetails(segmentId);
    console.log(segmentDetails.segmentQuery);
    return segmentDetails;
  }

  async updateSegmentQuery(dto: UpdateSegmentQueryDto): Promise<Segment> {
    const { segmentId, segmentQuery } = dto;
    const segment = await this.segmentPort.getSegmentDetails(segmentId);
    if (!segment) throw new Error('Segment not found');

    segment.updateSegmentQuery(segmentQuery);

    return await this.segmentPort.updateSegmentQuery(
      segmentId,
      segment.segmentQuery,
    );
  }

  async excuteSegmentQuery(segmentId: number) {
    const segment = await this.segmentPort.getSegmentDetails(segmentId);

    console.log(segment.segmentQuery);

    try {
      const result = await this.clientDbService.executeQuery(
        segment.segmentQuery,
      );
      return result;
    } catch (error) {
      console.error('Error executing query:', error);
      throw error;
    }
  }

  async getSegmentNames(): Promise<{ id: number; name: string }[]> {
    return await this.segmentPort.getSegmentNames();
  }

  async getSegmentColumn(columnName: string): Promise<any> {
    return await this.segmentPort.getSegmentColumn(columnName);
  }

  async getSegmentRecords(dto: GetSegmentDetailsDto): Promise<any[]> {
    const { databaseName, tableName, columnName } = dto;

    const useDatabaseQuery = `USE ${databaseName};`;
    await this.clientDbService.executeQuery(useDatabaseQuery);

    const query = `SELECT ${columnName} FROM ${tableName};`;
    const result = await this.clientDbService.executeQuery(query);

    return result.map((row) => row[columnName]);
  }

  async getSegmentTables(dto: GetSegmentDetailsDto): Promise<any[]> {
    const { databaseName } = dto;

    const query = `SELECT table_name FROM information_schema.tables WHERE table_schema = '${databaseName}';`;
    const result = await this.clientDbService.executeQuery(query);

    return result.map((row) => row['TABLE_NAME']);
  }

  async getSegmentColumns(dto: GetSegmentDetailsDto): Promise<any[]> {
    const { databaseName, tableName } = dto;

    const query = `SELECT column_name FROM information_schema.columns WHERE table_schema = '${databaseName}' AND table_name = '${tableName}';`;
    const result = await this.clientDbService.executeQuery(query);

    return result.map((row) => row['COLUMN_NAME']);
  }

  async createFilterQueryWhenNoFilter(segmentId: number): Promise<void> {
    const segment = await this.segmentPort.getSegmentDetails(segmentId);

    if (segment.filterQuery)
      throw new HttpException(
        'Filter Query가 이미 존재합니다.',
        HttpStatus.BAD_REQUEST,
      );
    await this.segmentPort.updateFilterQuery(segmentId, segment.segmentQuery);

    return;
  }

  async createFilterQuery(dto: CreateFilterQueryDto): Promise<any> {
    const { segmentId, columnName, value, excludeValue } = dto;

    const segment = await this.segmentPort.getSegmentDetails(segmentId);

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

    const modifiedQueryResult = await this.clientDbService.executeQuery(
      modifiedQuery,
    );

    return {
      modifiedQuery,
      modifiedQueryResult,
    };
  }
}
