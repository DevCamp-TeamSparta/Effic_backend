import { IsNotEmpty, IsString } from 'class-validator';

export class GetSegmentColumnDto {
  @IsString()
  @IsNotEmpty()
  columnName: string;
}
