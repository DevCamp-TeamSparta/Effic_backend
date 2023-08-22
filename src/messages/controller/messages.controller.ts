import { Body, Controller, Post, Logger, Headers } from '@nestjs/common';
import { MessagesService } from '../service/messages.service';
import { DefaultMessageDto } from '../dto/default-message.dto';
import { DefaultMessageValidationPipe } from '../pipe/defualt-body-validation-pipe';
import { AbTestMessageDto } from '../dto/abTest-message.dto';
import { abTestMessageValidationPipe } from '../pipe/abTest-body-validation-pipe';

@Controller('messages')
export class MessagesController {
  private logger = new Logger('MessagesController');
  constructor(private messagesService: MessagesService) {}

  @Post('/default')
  async defaultMessage(
    @Body(new DefaultMessageValidationPipe())
    defaultMessageDto: DefaultMessageDto,
    @Headers('email') headerEmail: string,
  ) {
    this.logger.verbose('Default message sending');
    await this.messagesService.defaultMessage(headerEmail, defaultMessageDto);
  }

  @Post('/abtest')
  async abTestMessage(
    @Body(new abTestMessageValidationPipe())
    abTestMessageDto: AbTestMessageDto,
    @Headers('email') headerEmail: string,
  ) {
    this.logger.verbose('AB test message sending');
    await this.messagesService.abTestMessage(headerEmail, abTestMessageDto);
  }
}
