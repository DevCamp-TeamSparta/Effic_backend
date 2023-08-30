import { IsNotEmpty, IsNumber, IsString } from 'class-validator';
import { PaymentMethod } from '../payment.enum';

export class CreatePaymentDto {
  @IsNumber()
  @IsNotEmpty()
  money: number;

  @IsString()
  @IsNotEmpty()
  paymentMethod: PaymentMethod;
}
