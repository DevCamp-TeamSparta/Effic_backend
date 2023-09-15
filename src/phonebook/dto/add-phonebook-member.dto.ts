import { IsArray, IsNotEmpty } from 'class-validator';

export class AddPhonebookMemberDto {
  @IsArray()
  @IsNotEmpty()
  addMembers: string[];
}
