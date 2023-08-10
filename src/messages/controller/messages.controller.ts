import { Body, Controller, Post } from '@nestjs/common';
import { MessagesService } from '../service/messages.service';
import { DefaultMessageDto } from '../dto/default-message.dto';

@Controller('messages')
export class MessagesController {
  constructor(private messagesService: MessagesService) {}

  @Post('/default')
  async defaultMessage(@Body() defaultMessageDto: DefaultMessageDto) {
    await this.messagesService.defaultMessage(defaultMessageDto);
  }
}
