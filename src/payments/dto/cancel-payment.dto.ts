import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

export class CancelPaymentDto {
  @IsOptional()
  imp_uid: string;

  @IsString()
  @IsNotEmpty()
  merchant_uid: string;

  @IsOptional()
  refundMoney: number;
}
