import { IsArray, IsNotEmpty } from 'class-validator';

export class FilterReceiverDto {
  @IsNotEmpty()
  @IsArray()
  receiverList: Array<string>;
}
