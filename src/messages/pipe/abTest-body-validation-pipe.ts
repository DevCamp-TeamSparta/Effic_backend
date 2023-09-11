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

    const uniqueReceiverPhones = new Set(receiverPhones);
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

    const uniqueUrl = new Set(value.messageInfoList[0].urlList);
    if (uniqueUrl.size !== value.messageInfoList[0].urlList.length) {
      throw new BadRequestException('Duplicate urls found');
    }

    const uniqueUrl2 = new Set(value.messageInfoList[1].urlList);
    if (uniqueUrl2.size !== value.messageInfoList[1].urlList.length) {
      throw new BadRequestException('Duplicate urls found');
    }

    const findSameUrl = value.messageInfoList[0].urlList.filter((x) =>
      value.messageInfoList[1].urlList.includes(x),
    );
    if (findSameUrl.length === 0) {
      throw new BadRequestException('There must be at least one same url');
    }

    const urlForResult = value.urlForResult;
    const findSameUrl2 = findSameUrl.filter((x) => urlForResult.includes(x));
    if (findSameUrl2.length === 0) {
      throw new BadRequestException(
        'There must be at least one same url in urlForResult',
      );
    }

    return value;
  }
}
