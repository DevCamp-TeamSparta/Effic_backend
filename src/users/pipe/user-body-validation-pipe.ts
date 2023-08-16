import { Injectable, PipeTransform, BadRequestException } from '@nestjs/common';
import { validate } from 'class-validator';
import { plainToClass } from 'class-transformer';
import { UpdateUserDto } from '../dto/update-user.dto';

@Injectable()
export class UserBodyValidationPipe implements PipeTransform {
  async transform(value: any): Promise<UpdateUserDto> {
    const hostnumberRegex = /^(\d{3}-\d{3,4}-\d{4}|\d{10})$/;

    if (value.hostnumber && !hostnumberRegex.test(value.hostnumber)) {
      throw new BadRequestException('hostnumber is not valid');
    }

    const updateUserDto = plainToClass(UpdateUserDto, value);
    const errors = await validate(updateUserDto);

    if (errors.length > 0) {
      throw new BadRequestException(errors);
    }

    return updateUserDto;
  }
}
