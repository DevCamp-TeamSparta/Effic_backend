import { Injectable, PipeTransform, BadRequestException } from '@nestjs/common';
import { TestMessageDto } from '../dto/test-message.dto';

@Injectable()
export class TestMessageValidationPipe implements PipeTransform {
  async transform(value: any): Promise<TestMessageDto> {
    const titleLength = value.title.length;
    if (titleLength > 30) {
      throw new BadRequestException('title is too long');
    }

    const contentLength = value.content.length;
    if (contentLength > 2000) {
      throw new BadRequestException('content is too long');
    }

    const receiverPhones = value.receiverList.map((info) => info.phone);

    const uniqueReceiverPhones = new Set(receiverPhones);
    if (uniqueReceiverPhones.size !== receiverPhones.length) {
      throw new BadRequestException('Duplicate phone numbers found');
    }
    if (receiverPhones.length > 1) {
      throw new BadRequestException('receiver is must 1');
    }

    const receivernumberRegex = /^(\d{11})$/;
    for (const phone of receiverPhones) {
      if (!receivernumberRegex.test(phone)) {
        throw new BadRequestException('receiver phone number is not valid');
      }
    }

    const uniqueUrl = new Set(value.urlList);
    if (uniqueUrl.size !== value.urlList.length) {
      throw new BadRequestException('Duplicate urls found');
    }

    return value;
  }
}
