import {
  Body,
  Controller,
  Post,
  Logger,
  Headers,
  Get,
  UseGuards,
} from '@nestjs/common';
import { MessagesService } from '../service/messages.service';
import { DefaultMessageDto } from '../dto/default-message.dto';
import { DefaultMessageValidationPipe } from '../pipe/defualt-body-validation-pipe';
import { AbTestMessageDto } from '../dto/abTest-message.dto';
import { abTestMessageValidationPipe } from '../pipe/abTest-body-validation-pipe';
import { TestMessageValidationPipe } from '../pipe/test-body-validation';
import { TestMessageDto } from '../dto/test-message.dto';
import { CheckHostNumberDto } from '../dto/check-number.dto';
import { FilterReceiverDto } from '../dto/filter-receiver.dto';
import * as jwt from 'jsonwebtoken';
import { AuthGuard } from 'src/auth.guard';
import { ApiTags } from '@nestjs/swagger';

@Controller('messages')
@ApiTags('Messages API')
@UseGuards(AuthGuard)
export class MessagesController {
  private logger = new Logger('MessagesController');
  constructor(private messagesService: MessagesService) {}

  // 기본메세지 보내기
  @Post('/default')
  async defaultMessage(
    @Body(new DefaultMessageValidationPipe())
    defaultMessageDto: DefaultMessageDto,
    @Headers('Authorization') authorization: string,
  ): Promise<object> {
    this.logger.verbose('Default message sending');

    const accessToken = authorization.split(' ')[1];
    const decodedAccessToken: any = jwt.decode(accessToken);

    const email = decodedAccessToken.email;

    const messageId = await this.messagesService.sendDefaultMessage(
      email,
      defaultMessageDto,
    );
    return { ...messageId };
  }

  // ab 메세지 보내기
  @Post('/abtest')
  async abTestMessage(
    @Body(new abTestMessageValidationPipe())
    abTestMessageDto: AbTestMessageDto,
    @Headers('Authorization') authorization: string,
  ) {
    this.logger.verbose('AB test message sending');

    const accessToken = authorization.split(' ')[1];
    const decodedAccessToken: any = jwt.decode(accessToken);

    const email = decodedAccessToken.email;

    this.logger.verbose('AB test message sending2');
    const result = await this.messagesService.sendAbTestMessage(
      email,
      abTestMessageDto,
    );

    return {
      messageGroupId: result.messageGroupId,
    };
  }

  // 테스트 메세지 보내기
  @Post('/test')
  async testMessage(
    @Body(new TestMessageValidationPipe())
    testMessageDto: TestMessageDto,
    @Headers('Authorization') authorization: string,
  ) {
    this.logger.verbose('Test message sending');

    const accessToken = authorization.split(' ')[1];
    const decodedAccessToken: any = jwt.decode(accessToken);

    const email = decodedAccessToken.email;

    const message = await this.messagesService.sendTestMessage(
      email,
      testMessageDto,
    );

    return { message };
  }

  // 발신번호 확인
  @Post('/checkhostnumber')
  async checkHostNumber(@Body() checkHostNumberDto: CheckHostNumberDto) {
    this.logger.verbose('Check host number');

    const message = await this.messagesService.checkHostNumberMessage(
      checkHostNumberDto,
    );

    return { message };
  }

  // 그룹 리스트 가져오기
  @Get('/group')
  async getGroupList(@Headers('Authorization') authorization: string) {
    const accessToken = authorization.split(' ')[1];
    const decodedAccessToken: any = jwt.decode(accessToken);

    const email = decodedAccessToken.email;
    const groupList = await this.messagesService.getGroupList(email);

    return { groupList };
  }

  // 광고성 문자 수신자 필터링
  @Post('/filter')
  async filterReceiver(
    @Body() filterReceiverDto: FilterReceiverDto,
    @Headers('Authorization') authorization: string,
  ) {
    const accessToken = authorization.split(' ')[1];
    const decodedAccessToken: any = jwt.decode(accessToken);

    const email = decodedAccessToken.email;
    const filteredReceivers = await this.messagesService.filteredReceivers(
      email,
      filterReceiverDto,
    );

    return { filteredReceivers };
  }
}
