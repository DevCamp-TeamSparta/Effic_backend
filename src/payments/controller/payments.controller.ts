import { Body, Controller, Logger, Post, Headers } from '@nestjs/common';
import { PaymentsService } from '../service/payments.service';
import { CreatePaymentDto } from '../dto/create-payment.dto';
import { Payment } from '../payments.entity';
import { CompletePaymentDto } from '../dto/complete-payment.dto';

@Controller('payments')
export class PaymentsController {
  private logger = new Logger('PaymentsController');
  constructor(private paymentsService: PaymentsService) {}

  @Post()
  async createPayment(
    @Body() createPaymentDto: CreatePaymentDto,
    @Headers('email') headerEmail: string,
  ): Promise<Payment> {
    this.logger.verbose('Payment create');
    const { money } = createPaymentDto;
    const payment = await this.paymentsService.createPayment(
      headerEmail,
      money,
    );

    return payment;
  }

  @Post('/complete')
  async completePayment(
    @Body() completePaymentDto: CompletePaymentDto,
    @Headers('email') headerEmail: string,
  ) {
    this.logger.verbose('Payment complete');
    const { imp_uid, merchant_uid } = completePaymentDto;
    const payment = await this.paymentsService.completePayment(
      headerEmail,
      imp_uid,
      merchant_uid,
    );

    return payment;
  }

  // @Post('/cancel')
  // async cancelPayment(
  //   @Body() cancelPaymentDto: CancelPaymentDto,
  //   @Headers('email') headerEmail: string,
  // ) {
  //   this.logger.verbose('Payment cancel');
  //   const { imp_uid, merchant_uid, refundMoney } = cancelPaymentDto;
  //   const payment = await this.paymentsService.cancelPayment(
  //     headerEmail,
  //     imp_uid,
  //     merchant_uid,
  //     refundMoney,
  //   );

  //   return payment;
  // }
}
