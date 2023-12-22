import { IsNotEmpty, IsString } from 'class-validator';

export class GetSegmentDetailsDto {
  @IsString()
  @IsNotEmpty()
  databaseName: string;

  @IsString()
  tableName?: string;

  @IsString()
  columnName?: string;
}
