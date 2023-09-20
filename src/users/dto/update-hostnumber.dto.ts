import { IsNotEmpty, IsNumber, IsArray } from 'class-validator';

export class UpdateHostnumberDto {
  @IsNumber()
  @IsNotEmpty()
  userId: number;

  @IsArray()
  @IsNotEmpty()
  hostnumberwithmemo: Array<{ hostnumber: string; memo: string }>;
}
