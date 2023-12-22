import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class UpdateSegmentQueryDto {
  @IsNumber()
  @IsNotEmpty()
  segmentId: number;

  @IsString()
  @IsNotEmpty()
  segmentQuery: string;
}
