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

  @IsNotEmpty()
  @IsString()
  hostnumber: string;

  @IsArray()
  @IsNotEmpty()
  receiverList: string[];

  @IsOptional()
  @IsBoolean()
  advertiseInfo?: boolean;

  @IsNotEmpty()
  @IsString()
  urlForResult: string;

  @IsString()
  @IsOptional()
  reservetime?: string;

  @IsArray()
  @IsOptional()
  urlList?: string[];
}
