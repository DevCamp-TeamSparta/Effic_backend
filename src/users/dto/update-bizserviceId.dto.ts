import { IsArray, IsNotEmpty, IsString } from 'class-validator';

export class UpdateBizserviceIdDto {
  @IsNotEmpty()
  @IsString()
  bizServiceId: string;

  @IsNotEmpty()
  @IsArray()
  plusFriendIdList: string[];
}
