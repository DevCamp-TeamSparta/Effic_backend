import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

export class UpdateSegmentQueryDto {
  @IsNumber()
  @IsNotEmpty()
  segmentId: number;

  @IsString()
  @IsNotEmpty()
  segmentQuery: string;

  @IsString()
  @IsOptional()
  email?: string;
}
