import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class GetSegmentDetailsDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  databaseName: string;

  @ApiProperty()
  @IsOptional()
  @IsString()
  tableName?: string;

  @ApiProperty()
  @IsOptional()
  @IsString()
  columnName?: string;
}
