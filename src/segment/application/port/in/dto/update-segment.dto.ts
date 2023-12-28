import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

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

  @IsOptional()
  updatedAt?: Date;

  @IsString()
  @IsOptional()
  email?: string;
}
