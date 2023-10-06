import { IsArray, IsNotEmpty, IsNumber } from 'class-validator';

export class FilterReceiverDto {
  @IsNotEmpty()
  @IsArray()
  receiverList: Array<string>;

  @IsNotEmpty()
  @IsNumber()
  day: number;
}
