import { IsNotEmpty, IsArray } from 'class-validator';

export class UpdateHostnumberDto {
  @IsArray()
  @IsNotEmpty()
  hostnumberwithmemo: Array<{ hostnumber: string; memo: string }>;
}
