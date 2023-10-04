import { IsArray, IsNotEmpty } from 'class-validator';

export class UpdatePlusFriendDto {
  @IsNotEmpty()
  @IsArray()
  plusFriendIdList: Array<{ plusFriendId: string; memo: string }>;
}
