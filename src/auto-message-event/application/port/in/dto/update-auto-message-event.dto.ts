import {
  IsBoolean,
  IsDate,
  IsNotEmpty,
  IsNumber,
  IsString,
} from 'class-validator';

export class UpdateAutoMessageEventDto {
  @IsNumber()
  @IsNotEmpty()
  autoMessageEventId: number;

  @IsString()
  autoMessageEventName?: string;

  totalSentCount?: number | null;
  clickCount?: number | null;
  clickRate?: number | null;

  @IsDate()
  scheduledEndDate?: Date;

  @IsDate()
  createdDate?: Date;

  @IsBoolean()
  isActive?: boolean;
}
