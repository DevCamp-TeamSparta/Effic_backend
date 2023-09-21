import { IsString, IsNotEmpty, IsOptional, IsArray } from 'class-validator';

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
  @IsOptional()
  imageInfo?: Array<{
    imageId: string;
    imageLink: string;
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
