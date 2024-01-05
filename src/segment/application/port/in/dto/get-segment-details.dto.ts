import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class GetSegmentDetailsDto {
  @ApiProperty()
  @IsString()
  @IsOptional()
  databaseName?: string;

  @ApiProperty()
  @IsOptional()
  @IsString()
  tableName?: string;

  @ApiProperty()
  @IsOptional()
  @IsString()
  columnName?: string;
}
