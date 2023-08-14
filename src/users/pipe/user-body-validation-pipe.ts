import { Injectable, PipeTransform, BadRequestException } from '@nestjs/common';

@Injectable()
export class UserBodyValidationPipe implements PipeTransform {
  transform(value: any): object {
    const hostnumberRegex = /^\d{3}-\d{3,4}-\d{4}$/;

    if (value.hostnumber) {
      if (!hostnumberRegex.test(value.hostnumber)) {
        throw new BadRequestException('hostnumber is not valid');
      }
    } else {
      return value;
    }
  }
}
