import { BadRequestException, Injectable, PipeTransform } from '@nestjs/common';
import { AbTestMessageDto } from '../dto/abTest-message.dto';

@Injectable()
export class abTestMessageValidationPipe implements PipeTransform {
  async transform(value: any): Promise<AbTestMessageDto> {
    const messageInfoList = value.messageInfoList;
    if (messageInfoList.length !== 2) {
      throw new BadRequestException('message info list is not valid');
    }

    const contentALength = value.messageInfoList[0].content.length;
    if (contentALength > 2000) {
      throw new BadRequestException('content is too long');
    }

    const contentBLength = value.messageInfoList[1].content.length;
    if (contentBLength > 2000) {
      throw new BadRequestException('content is too long');
    }

    const receiverPhones = value.receiverList.map((info) => info.phone);
    // const uniqueReceiverPhones = new Set(receiverPhones);
    // if (uniqueReceiverPhones.size !== receiverPhones.length) {
    //   throw new BadRequestException('Duplicate phone numbers found');
    // }

    // if (receiverPhones.length < 10) {
    //   throw new BadRequestException('receivers are must more than 9');
    // }

    const receivernumberRegex = /^(\d{11})$/;
    for (const phone of receiverPhones) {
      if (!receivernumberRegex.test(phone)) {
        throw new BadRequestException('receiver phone number is not valid');
      }
    }

    return value;
  }
}
