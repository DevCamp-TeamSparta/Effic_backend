import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsArray,
  IsObject,
} from 'class-validator';

export class DefaultBizmessageDto {
  @IsNotEmpty()
  @IsString()
  plusFriendId: string;

  @IsNotEmpty()
  @IsObject()
  bizMessageInfoList: Array<{
    content: string;
    isAd: boolean;
    urlList: string[];
  }>;

  @IsObject()
  @IsOptional()
  imageInfo?: Array<{
    imageId: string;
    imageLink: string;
  }>;

  @IsString()
  @IsNotEmpty()
  urlForResult: string;

  @IsArray()
  @IsNotEmpty()
  receiverList: string[];

  @IsArray()
  @IsOptional()
  buttonInfoList?: string[];

  @IsOptional()
  @IsString()
  reservetime?: string;
}
