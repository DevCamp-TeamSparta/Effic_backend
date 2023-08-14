import {
  IsArray,
  IsBoolean,
  IsDate,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';
import { DeviceModel } from '../message.enum';

export class DefaultMessageDto {
  @IsNotEmpty()
  @IsString()
  deviceModel: DeviceModel;

  @IsNotEmpty()
  @IsString()
  title: string;

  @IsNotEmpty()
  @IsString()
  content: string;

  @IsArray()
  @IsNotEmpty()
  receiver: string[];

  @IsNotEmpty()
  @IsBoolean()
  advertiseInfo?: boolean;

  @IsDate()
  @IsOptional()
  reservetime?: Date;

  @IsArray()
  @IsOptional()
  url?: string[];
}
