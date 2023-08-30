import { OmitType } from '@nestjs/mapped-types';
import { CreateUserDto } from './create-user.dto';

// createuserdto 에서 point만 제외하고 사용
export class UpdateUserDto extends OmitType(CreateUserDto, [
  'point',
  'email',
]) {}
