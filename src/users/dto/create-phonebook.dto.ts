import { IsArray, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreatePhonebookDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsArray()
  @IsNotEmpty()
  member: string[];

  @IsArray()
  @IsOptional()
  variableKey: string[];
}
