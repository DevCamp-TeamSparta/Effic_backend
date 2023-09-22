import { Injectable, PipeTransform } from '@nestjs/common';
import { DefaultBizmessageDto } from '../dto/default-bizmessage.dto';

@Injectable()
export class DefaultBizbodyValidationPipe implements PipeTransform {
  async transform(value: any): Promise<DefaultBizmessageDto> {
    if (value.buttonInfo) {
      const linkNameLength = value.buttonInfo.name.length;
      if (linkNameLength > 14) {
        throw new Error('linkName is too long');
      }
    }

    return value;
  }
}
