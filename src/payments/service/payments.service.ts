import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
  HttpException,
} from '@nestjs/common';
import { InjectEntityManager } from '@nestjs/typeorm';
import { EntityManager } from 'typeorm';
import { PaymentsRepository } from '../payments.repository';
import { UsersRepository } from '../../users/users.repository';
import { Payment, Refund } from '../payments.entity';
import axios from 'axios';
import { iamConfig } from 'config/iam.config';
import { v4 } from 'uuid';
import { RefundPaymentDto } from '../dto/refund-payment.dto';
import { slackConfig } from 'config/slack.config';

@Injectable()
export class PaymentsService {
  constructor(
    private readonly paymentsRepository: PaymentsRepository,
    private readonly usersRepository: UsersRepository,
    @InjectEntityManager() private readonly entityManager: EntityManager,
  ) {}

  // 결제금액 생성
  async createPayment(
    email: string,
    money: number,
    paymentMethod,
  ): Promise<Payment> {
    const user = await this.usersRepository.findOneByEmail(email);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (money < 1000) {
      throw new UnauthorizedException('Minimum payment amount is 1000');
    }

    if (money > 5000000) {
      throw new UnauthorizedException('Maximum payment amount is 100000');
    }

    const merchant_uid = () => {
      const tokens = v4().split('-');
      return tokens[2] + tokens[1] + tokens[0] + tokens[3] + tokens[4];
    };

    const payment = new Payment();
    payment.chargemoney = money;
    payment.name = user.name;
    payment.createdAt = new Date();
    payment.user = user;
    payment.merchant_uid = merchant_uid();
    payment.paymentMethod = paymentMethod;

    await this.entityManager.save(payment);

    return payment;
  }

  // 결제 결과 조회
  async completePayment(email: string, imp_uid: string, merchant_uid: string) {
    let amountToBePaid;
    try {
      const getToken = await axios({
        url: 'https://api.iamport.kr/users/getToken',
        method: 'post',
        headers: { 'Content-Type': 'application/json' },
        data: {
          imp_key: iamConfig.apiKey,
          imp_secret: iamConfig.secretKey,
        },
      });

      const { access_token } = getToken.data.response;

      // imp_uid로 포트원 서버에서 결제 정보 조회
      const getPaymentData = await axios({
        url: `https://api.iamport.kr/payments/${imp_uid}`,
        method: 'get',
        headers: { Authorization: access_token },
      });
      const paymentData = getPaymentData.data;

      // DB에서 결제되어야 하는 금액 조회
      const user = await this.usersRepository.findOneByEmail(email);
      const order = await this.paymentsRepository.findOneByPaymentId(
        merchant_uid,
      );
      amountToBePaid = order.chargemoney;
      user.money += amountToBePaid;

      await this.entityManager.save(user);

      order.isCompleted = true;

      await this.entityManager.save(order);

      return 'success';
      // 결제 검증
      // const { amount, status } = paymentData;
      // if (amount === amountToBePaid) {
      //   user.money += amountToBePaid;
      // } else {
      //   throw {
      //     status: 'forgery',
      //     message: '결제금액 불일치. 위조된 결제시도',
      //   };
      // }
    } catch (error) {
      this.cancelPayment(email, imp_uid, merchant_uid, amountToBePaid);
      throw new HttpException(error.response.data, error.response.status);
    }
  }

  // 결제 취소
  async cancelPayment(
    email: string,
    imp_uid: string,
    merchant_uid: string,
    refundMoney: number,
  ) {
    try {
      const user = await this.usersRepository.findOneByEmail(email);
      if (!user) {
        throw new NotFoundException('User not found');
      }

      const getToken = await axios({
        url: 'https://api.iamport.kr/users/getToken',
        method: 'post',
        headers: { 'Content-Type': 'application/json' },
        data: {
          imp_key: iamConfig.apiKey,
          imp_secret: iamConfig.secretKey,
        },
      });

      const { access_token } = getToken.data.response;

      // imp_uid로 포트원 서버에서 결제 정보 조회
      const getPaymentData = await axios({
        url: `https://api.iamport.kr/payments/${imp_uid}`,
        method: 'get',
        headers: { Authorization: access_token },
      });
      const paymentData = getPaymentData.data;
      const { amount, cancel_amount } = paymentData;

      const cancelableAmount = amount - cancel_amount;
      if (cancelableAmount <= 0) {
        throw new Error('취소 가능한 금액이 없습니다.');
      }

      // 결제 취소
      const getCancelData = await axios({
        url: 'https://api.iamport.kr/payments/cancel',
        method: 'post',
        headers: {
          'Content-Type': 'application/json',
          Authorization: access_token, // 포트원 서버로부터 발급받은 엑세스 토큰
        },
        data: {
          // reason, // 가맹점 클라이언트로부터 받은 환불사유
          imp_uid, // imp_uid를 환불 `unique key`로 입력
          amount: refundMoney, // 가맹점 클라이언트로부터 받은 환불금액
          checksum: cancelableAmount, // [권장] 환불 가능 금액 입력
        },
      });
      const { response } = getCancelData.data;
      user.money -= refundMoney;
    } catch (error) {
      console.log(error);
      throw error;
    }
  }

  // 충전금액 내역 조회
  async userPayments(email: string) {
    const user = await this.usersRepository.findOneByEmail(email);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const payments = await this.paymentsRepository.findAllByUserId(user.userId);

    return payments;
  }

  // 환불신청
  async refundPayment(email: string, refundPaymentDto: RefundPaymentDto) {
    const user = await this.usersRepository.findOneByEmail(email);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (user.money < refundPaymentDto.refundMoney) {
      throw new UnauthorizedException('Refund money is not enough');
    }

    const refund = new Refund();
    refund.createdAt = new Date();
    refund.refundmoney = refundPaymentDto.refundMoney;
    refund.accountHolder = refundPaymentDto.accountHolder;
    refund.accountNumber = refundPaymentDto.accountNumber;
    refund.bankName = refundPaymentDto.bankName;
    refund.contactNumber = refundPaymentDto.contactNumber;
    refund.user = user;

    await this.entityManager.save(refund);

    const slackMessage = {
      text: '환불신청이 들어왔습니다.',
      attachments: [
        {
          color: '#36a64f',
          fields: [
            {
              title: '신청정보',
              value: `환불신청금액: ${refundPaymentDto.refundMoney}원\n예금주: ${refundPaymentDto.accountHolder}\n은행명: ${refundPaymentDto.bankName}\n계좌번호: ${refundPaymentDto.accountNumber}\n연락처: ${refundPaymentDto.contactNumber}`,
            },
          ],
        },
      ],
    };

    try {
      await axios.post(slackConfig.alarmUrl, slackMessage, {
        headers: {
          'Content-Type': 'application/json',
        },
      });
    } catch (error) {
      console.log('Error sending Slack Message', error);
    }
  }
}
