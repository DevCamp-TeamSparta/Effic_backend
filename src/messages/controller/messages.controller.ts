import { Body, Controller, Post, Logger, Headers, Get } from '@nestjs/common';
import { MessagesService } from '../service/messages.service';
import { DefaultMessageDto } from '../dto/default-message.dto';
import { DefaultMessageValidationPipe } from '../pipe/defualt-body-validation-pipe';
import { AbTestMessageDto } from '../dto/abTest-message.dto';
import { abTestMessageValidationPipe } from '../pipe/abTest-body-validation-pipe';
import { TestMessageValidationPipe } from '../pipe/test-body-validation';
import { TestMessageDto } from '../dto/test-message.dto';
import { CheckHostNumberDto } from '../dto/check-number.dto';
import * as jwt from 'jsonwebtoken';

@Controller('messages')
export class MessagesController {
  private logger = new Logger('MessagesController');
  constructor(private messagesService: MessagesService) {}

  @Post('/default')
  async defaultMessage(
    @Body(new DefaultMessageValidationPipe())
    defaultMessageDto: DefaultMessageDto,
    @Headers('authorization') authorization: string,
  ) {
    this.logger.verbose('Default message sending');

    const accessToken = authorization.split(' ')[1];
    const decodedAccessToken: any = jwt.decode(accessToken);

    const email = decodedAccessToken.email;

    const messageId = await this.messagesService.defaultMessage(
      email,
      defaultMessageDto,
    );
    return { ...messageId };
  }

  @Post('/abtest')
  async abTestMessage(
    @Body(new abTestMessageValidationPipe())
    abTestMessageDto: AbTestMessageDto,
    @Headers('authorization') authorization: string,
  ) {
    this.logger.verbose('AB test message sending');

    const accessToken = authorization.split(' ')[1];
    const decodedAccessToken: any = jwt.decode(accessToken);

    const email = decodedAccessToken.email;

    this.logger.verbose('AB test message sending2');
    const result = await this.messagesService.abTestMessage(
      email,
      abTestMessageDto,
    );

    return {
      messageId: result.messageId,
      messageGroupId: result.messageGroupId,
    };
  }

  @Post('/test')
  async testMessage(
    @Body(new TestMessageValidationPipe())
    testMessageDto: TestMessageDto,
    @Headers('authorization') authorization: string,
  ) {
    this.logger.verbose('Test message sending');

    const accessToken = authorization.split(' ')[1];
    const decodedAccessToken: any = jwt.decode(accessToken);

    const email = decodedAccessToken.email;

    const message = await this.messagesService.testMessage(
      email,
      testMessageDto,
    );

    return { message };
  }

  @Post('/checkhostnumber')
  async checkHostNumber(@Body() checkHostNumberDto: CheckHostNumberDto) {
    this.logger.verbose('Check host number');

    const message = await this.messagesService.hostNumberCheckMessage(
      checkHostNumberDto,
    );

    return { message };
  }

  @Get('/group')
  async getGroupList(@Headers('authorization') authorization: string) {
    const accessToken = authorization.split(' ')[1];
    const decodedAccessToken: any = jwt.decode(accessToken);

    const email = decodedAccessToken.email;
    const groupList = await this.messagesService.getGroupList(email);

    return { groupList };
  }
}
