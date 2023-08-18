import { IsNotEmpty, IsString } from 'class-validator';

export class CompletePaymentDto {
  @IsString()
  @IsNotEmpty()
  imp_uid: string;

  @IsString()
  @IsNotEmpty()
  merchant_uid: string;
}
