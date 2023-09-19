import { Injectable, PipeTransform, BadRequestException } from '@nestjs/common';
import { CreatePhonebookDto } from '../dto/create-phonebook.dto';

@Injectable()
export class MemberValidatonPipe implements PipeTransform {
  async transform(value: any): Promise<CreatePhonebookDto> {
    // 멤버들의 number이 중복되면 안됨
    const memberNumbers = value.members.map((info) => info.number);
    const uniqueMemberNumbers = new Set(memberNumbers);
    if (uniqueMemberNumbers.size !== memberNumbers.length) {
      throw new BadRequestException('Duplicate phone numbers found');
    }

    // 멤버들의 number이 11자리 숫자가 아니면 안됨
    const memberNumberRegex = /^(\d{11})$/;
    for (const number of memberNumbers) {
      if (!memberNumberRegex.test(number)) {
        throw new BadRequestException('member phone number is not valid');
      }
    }

    return value;
  }
}
