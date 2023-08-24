import {
  IsArray,
  IsBoolean,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';

export class DefaultMessageDto {
  @IsNotEmpty()
  @IsString()
  hostnumber: string;

  @IsNotEmpty()
  @IsString()
  title: string;

  @IsNotEmpty()
  @IsString()
  content: string;

  @IsArray()
  @IsNotEmpty()
  receiverList: string[];

  @IsNotEmpty()
  @IsBoolean()
  advertiseInfo?: boolean;

  @IsString()
  @IsOptional()
  reservetime?: string;

  @IsArray()
  @IsNotEmpty()
  urlList?: string[];
}
