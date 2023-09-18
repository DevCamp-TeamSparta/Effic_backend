import { IsNotEmpty } from 'class-validator';

export class FilterReceiverDto {
  @IsNotEmpty()
  number: string;
}
