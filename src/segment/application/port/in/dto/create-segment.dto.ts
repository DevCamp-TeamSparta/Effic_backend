import { Type } from 'class-transformer';
import {
  IsDate,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  isDate,
} from 'class-validator';

export class CreateSegmentDto {
  @IsString()
  @IsNotEmpty()
  segmentName: string;

  @IsString()
  @IsOptional()
  segmentDescription?: string;

  @Type(() => Date)
  @IsDate()
  @IsNotEmpty()
  createdAt: Date;

  @Type(() => Date)
  @IsDate()
  @IsOptional()
  updatedAt?: Date;

  @IsString()
  @IsOptional()
  email?: string;
}
