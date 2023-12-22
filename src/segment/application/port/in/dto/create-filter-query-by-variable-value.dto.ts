import { IsBoolean, IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class CreateFilterQueryByVariableValueDto {
  @IsNotEmpty()
  @IsNumber()
  segmentId: number;

  @IsNotEmpty()
  @IsString()
  columnName: string;

  @IsNotEmpty()
  @IsString()
  value: string;

  @IsNotEmpty()
  @IsBoolean()
  excludeValue: boolean;
}
