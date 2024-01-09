import { IsBoolean, IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class SendTestMessageDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsNotEmpty()
  content: string;

  @IsString()
  @IsNotEmpty()
  hostnumber: string;

  @IsString()
  @IsNotEmpty()
  receiverNumber: string;

  @IsBoolean()
  @IsNotEmpty()
  advertiseInfo: boolean;

  @IsString()
  @IsNotEmpty()
  email: string;

  @IsNumber()
  @IsNotEmpty()
  autoMessageEventId: number;
}
