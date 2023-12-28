import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

export class CreateFilterQueryByFatigueLevelDto {
  @IsNumber()
  @IsNotEmpty()
  segmentId: number;

  @IsString()
  @IsNotEmpty()
  receiverNumberColumnName: string;

  @IsNumber()
  @IsNotEmpty()
  fatigueLevelDays: number;

  @IsString()
  @IsOptional()
  email?: string;
}
