import { IsOptional, IsString } from 'class-validator';

export class UpdatePhonebookDto {
  @IsString()
  @IsOptional()
  name: string;

  @IsString()
  @IsOptional()
  number: string;
}
