import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class RefundPaymentDto {
  @IsNumber()
  @IsNotEmpty()
  refundMoney;

  @IsNotEmpty()
  @IsString()
  accountHolder;

  @IsNotEmpty()
  @IsString()
  accountNumber;

  @IsNotEmpty()
  @IsString()
  bankName;

  @IsNotEmpty()
  @IsString()
  contactNumber;
}
