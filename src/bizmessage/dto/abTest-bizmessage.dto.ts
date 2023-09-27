import { IsArray, IsNotEmpty, IsString } from 'class-validator';

export class AbTestBizmessageDto {
  @IsNotEmpty()
  @IsString()
  plusFriendId: string;

  @IsNotEmpty()
  @IsArray()
  receiverList: string[];

  @IsNotEmpty()
  @IsArray()
  messageInfoList: Array<{
    type: string;
    bizMessageInfoList: {
      content: string;
      isAd: boolean;
      urlList: string[];
    };
    imageInfo?: {
      imageId: string;
      imageLink: string;
    };
    buttonInfoList?: Array<{
      type: string;
      name: string;
      buttonLink: string;
    }>;
  }>;
}
