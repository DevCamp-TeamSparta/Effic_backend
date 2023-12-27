import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class GetSegmentDetailsDto {
  @IsString()
  @IsNotEmpty()
  databaseName: string;

  @IsOptional()
  @IsString()
  tableName?: string;

  @IsOptional()
  @IsString()
  columnName?: string;
}
