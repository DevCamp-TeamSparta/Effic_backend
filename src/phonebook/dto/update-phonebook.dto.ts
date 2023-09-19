import { IsNotEmpty, IsString } from 'class-validator';

export class UpdatePhonebookDto {
  @IsString()
  @IsNotEmpty()
  title: string;
}
