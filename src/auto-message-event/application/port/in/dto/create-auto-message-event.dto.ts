import { Type } from 'class-transformer';
import {
  IsBoolean,
  IsDate,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  isNotEmpty,
} from 'class-validator';

export class CreateAutoMessageEventDto {
  @IsString()
  @IsNotEmpty()
  autoMessageEventName: string;

  @IsNumber()
  @IsOptional()
  totalSentCount?: number | null;

  @IsNumber()
  @IsOptional()
  clickCount?: number | null;

  @IsNumber()
  @IsOptional()
  clickRate?: number | null;

  @Type(() => Date)
  @IsDate()
  @IsOptional()
  scheduledEndDate?: Date;

  @Type(() => Date)
  @IsDate()
  @IsNotEmpty()
  createdDate: Date;

  @IsBoolean()
  @IsNotEmpty()
  isActive: boolean;

  @IsString()
  @IsOptional()
  email?: string;
}
