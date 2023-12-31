import {
  Body,
  Controller,
  Logger,
  Post,
  Headers,
  Get,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { PaymentsService } from '../service/payments.service';
import { CreatePaymentDto } from '../dto/create-payment.dto';
import { Payment } from '../payments.entity';
import { CompletePaymentDto } from '../dto/complete-payment.dto';
import * as jwt from 'jsonwebtoken';
import { RefundPaymentDto } from '../dto/refund-payment.dto';
import { ApiTags } from '@nestjs/swagger';

@Controller('payments')
@ApiTags('Payments API')
export class PaymentsController {
  private logger = new Logger('PaymentsController');
  constructor(private paymentsService: PaymentsService) {}

  @Post()
  async createPayment(
    @Body() createPaymentDto: CreatePaymentDto,
    @Headers('Authorization') authorization: string,
  ): Promise<Payment> {
    this.logger.verbose('Payment create');

    const accessToken = authorization.split(' ')[1];
    const decodedAccessToken: any = jwt.decode(accessToken);

    const email = decodedAccessToken.email;

    const { money, paymentMethod } = createPaymentDto;
    const payment = await this.paymentsService.createPayment(
      email,
      money,
      paymentMethod,
    );

    return payment;
  }

  @Post('/complete')
  async completePayment(
    @Body() completePaymentDto: CompletePaymentDto,
    @Headers('Authorization') authorization: string,
  ) {
    this.logger.verbose('Payment complete');

    const accessToken = authorization.split(' ')[1];
    const decodedAccessToken: any = jwt.decode(accessToken);

    const email = decodedAccessToken.email;

    const { imp_uid, merchant_uid } = completePaymentDto;
    const payment = await this.paymentsService.completePayment(
      email,
      imp_uid,
      merchant_uid,
    );

    return payment;
  }

  @Get('/me')
  async myPayments(@Headers('Authorization') authorization: string) {
    if (!authorization) {
      throw new HttpException('Unauthorized', HttpStatus.UNAUTHORIZED);
    }
    const accessToken = authorization.split(' ')[1];
    const decodedAccessToken: any = jwt.decode(accessToken);

    this.logger.verbose('User payments');
    const result = await this.paymentsService.userPayments(
      decodedAccessToken.email,
    );
    return result;
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

  // 환불신청
  @Post('/refund')
  async refundPayment(
    @Body() refundPaymentDto: RefundPaymentDto,
    @Headers('Authorization') authorization: string,
  ) {
    this.logger.verbose('Payment refund');

    const accessToken = authorization.split(' ')[1];
    const decodedAccessToken: any = jwt.decode(accessToken);

    const email = decodedAccessToken.email;

    const payment = await this.paymentsService.refundPayment(
      email,
      refundPaymentDto,
    );

    return payment;
  }
}
