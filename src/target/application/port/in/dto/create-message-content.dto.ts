import {
  IsBoolean,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';

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

  @IsString()
  @IsNotEmpty()
  hostnumber: string;

  @IsBoolean()
  @IsNotEmpty()
  advertiseInfo: boolean;

  @IsString()
  @IsOptional()
  email?: string;
}
