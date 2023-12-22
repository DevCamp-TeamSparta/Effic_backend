import { Type } from 'class-transformer';
import {
  IsDate,
  IsNotEmpty,
  IsOptional,
  IsString,
  isDate,
} from 'class-validator';

export class CreateSegmentDto {
  @IsString()
  @IsNotEmpty()
  segmentName: string;

  @IsString()
  @IsNotEmpty()
  segmentDescription: string;

  @Type(() => Date)
  @IsDate()
  @IsNotEmpty()
  createdAt: Date;

  @Type(() => Date)
  @IsDate()
  @IsOptional()
  updatedAt?: Date;
}
