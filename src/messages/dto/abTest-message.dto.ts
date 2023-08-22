import {
  IsArray,
  IsBoolean,
  IsDate,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';

export class AbTestMessageDto {
  @IsNotEmpty()
  @IsArray()
  messageInfoList: string[];

  @IsOptional()
  @IsString()
  type: string;

  @IsNotEmpty()
  @IsString()
  hostnumber: string;

  @IsOptional()
  @IsString()
  title: string;

  @IsOptional()
  @IsString()
  content: string;

  @IsArray()
  @IsNotEmpty()
  receiverList: string[];

  @IsOptional()
  @IsBoolean()
  advertiseInfo?: boolean;

  @IsNotEmpty()
  @IsString()
  urlForResult: string;

  @IsDate()
  @IsOptional()
  reservetime?: Date;

  @IsArray()
  @IsOptional()
  urlList?: string[];
}
