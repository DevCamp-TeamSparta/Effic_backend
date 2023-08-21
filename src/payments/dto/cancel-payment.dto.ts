import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

export class CancelPaymentDto {
  @IsOptional()
  imp_uid: string;

  @IsString()
  @IsNotEmpty()
  merchant_uid: string;

  @IsNumber()
  cancel_request_amount: number;

  @IsString()
  reason: string;

  @IsString()
  refund_holder: string;

  @IsString()
  refund_bank: string;

  @IsString()
  refund_account: number;

  @IsOptional()
  refundMoney: number;
}
