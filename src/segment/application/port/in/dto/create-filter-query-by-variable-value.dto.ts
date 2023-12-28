import {
  IsBoolean,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';

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

  @IsString()
  @IsOptional()
  email?: string;
}
