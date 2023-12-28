import { Type } from 'class-transformer';
import {
  IsDate,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';

export class UpdateSegmentDto {
  @IsNumber()
  @IsNotEmpty()
  segmentId: number;

  @IsString()
  @IsOptional()
  segmentName?: string;

  @IsString()
  @IsOptional()
  segmentDescription?: string;

  @IsDate()
  @IsOptional()
  updatedAt?: Date;

  @IsString()
  @IsOptional()
  email?: string;
}
