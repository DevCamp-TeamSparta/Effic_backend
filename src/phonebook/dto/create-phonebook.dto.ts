import { IsArray, IsNotEmpty, IsString } from 'class-validator';

export class CreatePhonebookDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsArray()
  @IsNotEmpty()
  members: string[];
}
