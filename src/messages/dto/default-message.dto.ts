import {
  IsArray,
  IsBoolean,
  IsDate,
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

  @IsDate()
  @IsOptional()
  reservetime?: Date;

  @IsArray()
  @IsNotEmpty()
  urlList?: string[];
}
