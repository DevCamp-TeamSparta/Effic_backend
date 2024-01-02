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

  @IsOptional()
  @IsString()
  timeColumnName: string;

  @IsNotEmpty()
  @IsString()
  receiverNumberColumnName: string;

  @IsOptional()
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
  @IsNotEmpty()
  isRecurring: boolean;

  @IsString({ each: true })
  @IsOptional()
  weekDays?: string[];

  @IsString()
  @IsOptional()
  email?: string;
}
