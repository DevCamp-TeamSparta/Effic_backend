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

  @Post('/reservation-time')
  @HttpCode(HttpStatus.CREATED)
  async createTargetReservationTime(
    @Body() dto: CreateTargetReservationTimeDto,
  ): Promise<void> {
    return this.targetUseCase.createTargetReservationTime(dto);
  }
}
