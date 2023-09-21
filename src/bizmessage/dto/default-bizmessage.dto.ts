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

  @IsArray()
  @IsOptional()
  imageInfo?: Array<{
    imageId: string;
    imageLink: string;
    imageUrl: string;
  }>;

  @IsArray()
  @IsNotEmpty()
  receiverList: string[];

  @IsArray()
  @IsOptional()
  buttonInfo?: string[];

  @IsOptional()
  @IsString()
  reservetime?: string;
}
