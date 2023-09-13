import { IsArray, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreatePhonebookDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsOptional()
  name: string;

  @IsString()
  @IsNotEmpty()
  phone: string;

  @IsArray()
  @IsOptional()
  variableKey: string[];
}
