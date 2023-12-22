import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class CreateMessageContentDto {
  @IsString()
  @IsNotEmpty()
  messageTitle: string;

  @IsString()
  @IsNotEmpty()
  messageContentTemplate: string;

  @IsString()
  @IsNotEmpty()
  receiverNumberColumnName: string;

  @IsNumber()
  @IsNotEmpty()
  segmentId: number;
}
