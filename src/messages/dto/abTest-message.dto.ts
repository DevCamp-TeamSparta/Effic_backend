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

  @IsDate()
  @IsOptional()
  reservetime?: Date;

  @IsArray()
  @IsOptional()
  urlList?: string[];
}
