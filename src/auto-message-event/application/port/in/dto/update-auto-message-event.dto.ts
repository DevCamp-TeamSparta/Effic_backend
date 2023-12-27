import { Type } from 'class-transformer';
import {
  IsBoolean,
  IsDate,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';

export class UpdateAutoMessageEventDto {
  @IsNumber()
  @IsNotEmpty()
  autoMessageEventId: number;

  @IsOptional()
  @IsString()
  autoMessageEventName?: string;

  @IsOptional()
  @IsNumber()
  totalSentCount?: number | null;

  @IsOptional()
  @IsNumber()
  clickCount?: number | null;

  @IsOptional()
  @IsNumber()
  clickRate?: number | null;

  @IsOptional()
  @Type(() => Date)
  @IsDate()
  scheduledEndDate?: Date;

  @IsOptional()
  @Type(() => Date)
  @IsDate()
  createdDate?: Date;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
