import { BadRequestException, Injectable, PipeTransform } from '@nestjs/common';
import { DefaultBizmessageDto } from '../dto/default-bizmessage.dto';

@Injectable()
export class DefaultBizbodyValidationPipe implements PipeTransform {
  async transform(value: any): Promise<DefaultBizmessageDto> {
    if (value.buttonInfoList) {
      value.buttonInfoList.forEach((buttonInfo) => {
        const linkNameLength = buttonInfo.name.length;
        if (linkNameLength > 14) {
          throw new Error('linkName is too long');
        }
      });
    }

    const receiverPhones = value.receiverList.map((info) => info.phone);

    const uniqueReceiverPhones = new Set(receiverPhones);
    if (uniqueReceiverPhones.size !== receiverPhones.length) {
      throw new BadRequestException('Duplicate phone numbers found');
    }

    return value;
  }
}
