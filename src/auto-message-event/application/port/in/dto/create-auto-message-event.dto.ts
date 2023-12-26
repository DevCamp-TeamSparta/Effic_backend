import { IsBoolean, IsDate, IsNotEmpty, IsString } from 'class-validator';

export class CreateAutoMessageEventDto {
  @IsString()
  @IsNotEmpty()
  autoMessageEventName: string;

  totalSentCount?: number | null;
  clickCount?: number | null;
  clickRate?: number | null;

  @IsDate()
  scheduledEndDate: Date;

  @IsDate()
  createdDate: Date;

  @IsBoolean()
  isActive: boolean;
}
