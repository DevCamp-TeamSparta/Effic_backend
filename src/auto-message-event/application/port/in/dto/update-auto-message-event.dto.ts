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

  @IsNumber()
  @IsOptional()
  segmentId?: number;

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

  @IsString()
  @IsOptional()
  email?: string;

  @IsBoolean()
  @IsOptional()
  isReserved?: boolean;

  @IsString()
  @IsOptional()
  updatedAtColumnName?: string;

  @IsOptional()
  @Type(() => Date)
  @IsDate()
  autoMessageEventLastRunTime?: Date;

  @IsOptional()
  @IsBoolean()
  advertiseInfo?: boolean;

  @IsOptional()
  @IsString()
  hostnumber?: string;

  @IsOptional()
  @IsString()
  messageContentTemplate?: string;

  @IsOptional()
  @IsString()
  messageTitle?: string;

  /** */
  @IsOptional()
  @Type(() => Date)
  @IsDate()
  reservationTime?: Date;

  @IsOptional()
  @IsNumber({}, { each: true })
  targetIds?: number[];

  @IsOptional()
  @IsBoolean()
  isRecurring?: boolean;

  @IsOptional()
  @IsString()
  receiverNumberColumnName?: string;

  @IsOptional()
  @IsString({ each: true })
  weekDays?: string[];

  @IsOptional()
  @Type(() => Date)
  @IsDate()
  endDate?: Date;

  @IsOptional()
  @IsString()
  timeColumnName?: string;

  @IsOptional()
  @IsNumber()
  delayDays?: number;
}
