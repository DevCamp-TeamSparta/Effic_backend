import { Body, Controller, Post, Logger, Headers } from '@nestjs/common';
import { MessagesService } from '../service/messages.service';
import { UsersService } from '../../users/service/users.service';
import { DefaultMessageDto } from '../dto/default-message.dto';

@Controller('messages')
export class MessagesController {
  private logger = new Logger('MessagesController');
  constructor(
    private messagesService: MessagesService,
    private usersService: UsersService,
  ) {}

  @Post('/default')
  async defaultMessage(
    @Body() defaultMessageDto: DefaultMessageDto,
    @Headers('email') headerEmail: string,
  ) {
    this.logger.verbose('Default message');
    await this.messagesService.defaultMessage(headerEmail, defaultMessageDto);
  }
}
