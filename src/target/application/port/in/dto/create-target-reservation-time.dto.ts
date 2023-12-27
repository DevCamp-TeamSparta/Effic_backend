import { Type } from 'class-transformer';
import {
  ArrayNotEmpty,
  IsBoolean,
  IsDate,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';

export class CreateTargetReservationTimeDto {
  @IsNotEmpty()
  @ArrayNotEmpty()
  @IsNumber({}, { each: true })
  targetIds: number[];

  @IsNotEmpty()
  @IsNumber()
  segmentId: number;

  @IsNotEmpty()
  @IsString()
  timeColumnName: string;

  @IsNotEmpty()
  @IsString()
  receiverNumberColumnName: string;

  @IsNotEmpty()
  @IsNumber()
  delayDays: number;

  @IsNotEmpty()
  @Type(() => Date)
  @IsDate()
  reservationTime: Date;

  @IsDate()
  @Type(() => Date)
  @IsOptional()
  endDate?: Date;

  @IsBoolean()
  @IsOptional()
  isRecurring?: boolean;

  @IsString({ each: true })
  @IsOptional()
  weekDays?: string[];
}
