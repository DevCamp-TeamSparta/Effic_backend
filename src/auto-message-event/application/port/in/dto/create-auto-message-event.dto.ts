import { Type } from 'class-transformer';
import {
  IsBoolean,
  IsDate,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
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
  scheduledEndDate: Date;

  @Type(() => Date)
  @IsDate()
  createdDate: Date;

  @IsBoolean()
  isActive: boolean;
}
