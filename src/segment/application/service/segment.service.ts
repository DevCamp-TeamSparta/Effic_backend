import { Inject, Injectable } from '@nestjs/common';
import { ISegmentUseCase } from '../port/in/segment.use-case';
import { ISegmentPort, ISegmentPortSymbol } from '../port/out/segment.port';
import { CreateSegmentDto } from '../port/in/dto/create-segment.dto';
import { Segment } from 'src/segment/domain/segment';
import { UpdateSegmentQueryDto } from '../port/in/dto/update-segment.dto';
import {
  IClientDbService,
  IClientDbServiceSymbol,
} from 'src/client-db/client-db.interface';
import { GetSegmentRecordsDto } from '../port/in/dto/get-segment-records.dto';

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
    const newSegment = new Segment(segmentName, segmentDescription, null);
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

  async getSegmentNames(): Promise<string[]> {
    return await this.segmentPort.getSegmentNames();
  }

  async getSegmentColumn(columnName: string): Promise<any> {
    return await this.segmentPort.getSegmentColumn(columnName);
  }

  async getSegmentRecords(dto: GetSegmentRecordsDto): Promise<any[]> {
    const { databaseName, tableName, columnName } = dto;

    const useDatabaseQuery = `USE ${databaseName};`;
    await this.clientDbService.executeQuery(useDatabaseQuery);

    const query = `SELECT ${columnName} FROM ${tableName};`;
    const result = await this.clientDbService.executeQuery(query);

    return result.map((row) => row[columnName]);
  }
}
