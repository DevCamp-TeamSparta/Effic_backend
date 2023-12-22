import {
  ArrayNotEmpty,
  IsBoolean,
  IsDate,
  IsNotEmpty,
  IsNumber,
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
  @IsString()
  delayDays: number;

  @IsNotEmpty()
  @IsDate()
  reservationTime: Date;

  @IsDate()
  endDate?: Date;

  @IsBoolean()
  isRecurring?: boolean;

  @IsString({ each: true })
  weekDays?: string[];
}
