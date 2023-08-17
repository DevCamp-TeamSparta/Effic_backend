import { IsNotEmpty, IsNumber } from 'class-validator';

export class DefaultResultDto {
  @IsNotEmpty()
  @IsNumber()
  totalClicks: number;

  @IsNotEmpty()
  @IsNumber()
  humanClicks: number;
}
