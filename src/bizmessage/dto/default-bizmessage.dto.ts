import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsBoolean,
  IsArray,
} from 'class-validator';

export class DefaultBizmessageDto {
  @IsNotEmpty()
  @IsString()
  plusFriendId: string;

  @IsArray()
  @IsNotEmpty()
  bizMessageInfoList: Array<{
    content: string;
    isAd: boolean;
    urlList: string[];
  }>;

  @IsArray()
  @IsNotEmpty()
  receiverList: string[];

  @IsArray()
  @IsOptional()
  buttonList?: string[];

  @IsOptional()
  @IsString()
  reservetime?: string;
}
