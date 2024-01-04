import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Inject,
  Logger,
  Post,
  Req,
  UseGuards,
  UsePipes,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { AccessTokenGuard } from 'src/auth/guards/auth.guard';
import { CreateMessageContentDto } from 'src/target/application/port/in/dto/create-message-content.dto';
import { CreateTargetReservationTimeDto } from 'src/target/application/port/in/dto/create-target-reservation-time.dto';
import { SmsTestDto } from 'src/target/application/port/in/dto/sms-test.dto';
import { SanitizePhoneNumberPipe } from 'src/target/application/port/in/pipe/sanitize-phone-number.pipe';
import {
  ITargetUseCase,
  ITargetUseCaseSymbol,
} from 'src/target/application/port/in/target.use-case';

@Controller('target')
@ApiTags('Target API')
export class TargetController {
  private logger = new Logger('TargetController');
  constructor(
    @Inject(ITargetUseCaseSymbol)
    private readonly targetUseCase: ITargetUseCase,
  ) {}

  @Post('/sms/test')
  @HttpCode(HttpStatus.OK)
  @UsePipes(new SanitizePhoneNumberPipe())
  async smsTest(@Body() dto: SmsTestDto) {
    return this.targetUseCase.smsTest(dto);
  }

  @UseGuards(AccessTokenGuard)
  @Post('/message-content')
  @HttpCode(HttpStatus.CREATED)
  async createMessageContent(
    @Req() req,
    @Body() dto: CreateMessageContentDto,
  ): Promise<TargetData[]> {
    this.logger.verbose('createMessageContent');
    dto.email = req.payload.email;
    return this.targetUseCase.createMessageContent(dto);
  }

  @UseGuards(AccessTokenGuard)
  @Post('/reservation-time')
  @HttpCode(HttpStatus.CREATED)
  async createTargetReservationTime(
    @Req() req,
    @Body() dto: CreateTargetReservationTimeDto,
  ): Promise<void> {
    this.logger.verbose('createTargetReservationTime');
    dto.email = req.payload.email;
    return this.targetUseCase.createTargetReservationTime(dto);
  }

  /**Cron 서버
   * - Target 테이블을 순회하면서 예약된 문자 발송
   */
  @Post('/reserved-message')
  @HttpCode(HttpStatus.OK)
  async sendReservedMessage(): Promise<void> {
    this.logger.verbose('sendReservedMessage');
    return this.targetUseCase.sendReservedMessage();
  }

  /**Cron 서버
   * - 자동화 기능
   */
  @Post('/auto')
  @HttpCode(HttpStatus.OK)
  async automateTargetDataProcessing(): Promise<void> {
    this.logger.verbose('automateTargetDataProcessing');
    return this.targetUseCase.automateTargetDataProcessing();
  }
}
