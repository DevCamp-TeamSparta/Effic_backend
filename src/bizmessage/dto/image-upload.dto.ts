import { IsNotEmpty, IsString } from 'class-validator';

export class ImageUploadDto {
  @IsNotEmpty()
  @IsString()
  plusFriendId: string;

  @IsNotEmpty()
  @IsString()
  isWide: string;
}
