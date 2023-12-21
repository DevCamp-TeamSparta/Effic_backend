import { PipeTransform, Injectable, ArgumentMetadata } from '@nestjs/common';

@Injectable()
export class SanitizePhoneNumberPipe implements PipeTransform {
  transform(value: any, metadata: ArgumentMetadata) {
    if (metadata.type !== 'body') return value;

    if (typeof value.phoneNumber === 'number') {
      value.phoneNumber = value.phoneNumber.toString().replace(/^0+/, '');
    } else if (typeof value.phoneNumber === 'string') {
      value.phoneNumber = value.phoneNumber
        .replace(/-/g, '')
        .replace(/^0+/, '');
    }

    return value;
  }
}
