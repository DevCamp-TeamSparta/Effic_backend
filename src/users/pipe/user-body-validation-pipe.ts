import { Injectable, PipeTransform, BadRequestException } from '@nestjs/common';
import { validate } from 'class-validator';
import { plainToClass } from 'class-transformer';
import { UpdateUserDto } from '../dto/update-user.dto';
import { CreateUserDto } from '../dto/create-user.dto';

@Injectable()
export class UserBodyValidationPipe implements PipeTransform {
  async transform(value: any): Promise<UpdateUserDto | CreateUserDto> {
    const hostnumberRegex = /^(\d{7}|\d{8}|\d{9}|\d{10}|\d{11})$/;

    if (
      value.hostnumber.length &&
      value.hostnumber.every((n) => !hostnumberRegex.test(n))
    ) {
      throw new BadRequestException('hostnumber is not valid');
    }

    if (value instanceof CreateUserDto || value instanceof UpdateUserDto) {
      const userDtoClass =
        value instanceof CreateUserDto ? CreateUserDto : UpdateUserDto;
      const userDto = plainToClass(userDtoClass, value);
      const errors = await validate(userDto);

      if (errors.length > 0) {
        throw new BadRequestException(errors);
      }

      return userDto;
    }
  }
}
