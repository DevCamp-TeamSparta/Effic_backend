import {
  Controller,
  Logger,
  Post,
  Body,
  Headers,
  Param,
  Patch,
  Get,
  Delete,
} from '@nestjs/common';
import { PhonebookService } from '../service/phonebook.service';
import * as jwt from 'jsonwebtoken';
import { CreatePhonebookDto } from '../dto/create-phonebook.dto';
import { UpdateMembersDto } from '../dto/update-members.dto';
import { AddPhonebookMemberDto } from '../dto/add-phonebook-member.dto';
import { UpdatePhonebookDto } from '../dto/update-phonebook.dto';
import { UsersService } from 'src/users/service/users.service';

@Controller('phonebook')
export class PhonebookController {
  private logger = new Logger('PhonebookController');
  constructor(
    private phonebookService: PhonebookService,
    private readonly usersService: UsersService,
  ) {}

  // 주소록 생성
  @Post()
  async createPhonebook(
    @Body() createPhonebookDto: CreatePhonebookDto,
    @Headers('Authorization') authorization: string,
  ): Promise<object> {
    this.logger.verbose('Create phonebook');
    const accessToken = authorization.split(' ')[1];
    const decodedAccessToken: any = jwt.decode(accessToken);
    const email = decodedAccessToken.email;
    const user = await this.usersService.checkUserInfo(email);
    return this.phonebookService.createPhonebook(
      user.userId,
      createPhonebookDto,
    );
  }

  // 주소록 멤버 수정
  @Patch('/members/:contactId')
  async updatePhonebook(
    @Body() updateMembersDto: UpdateMembersDto,
    @Headers('Authorization') authorization: string,
    @Param('contactId') contactId: number,
  ): Promise<object> {
    this.logger.verbose('Update phonebook');
    const accessToken = authorization.split(' ')[1];
    const decodedAccessToken: any = jwt.decode(accessToken);
    const email = decodedAccessToken.email;
    const user = await this.usersService.checkUserInfo(email);
    return this.phonebookService.updatePhonebook(
      user.userId,
      contactId,
      updateMembersDto,
    );
  }

  // 주소록 목록 조회
  @Get('/AllContacts')
  async findphonebookList(@Headers('Authorization') authorization: string) {
    this.logger.verbose('Find all contacts');
    const accessToken = authorization.split(' ')[1];
    const decodedAccessToken: any = jwt.decode(accessToken);
    const email = decodedAccessToken.email;
    const user = await this.usersService.checkUserInfo(email);
    return this.phonebookService.findphonebookList(user.userId);
  }

  // 주소록 멤버 조회
  @Get('/:phonebookId')
  async findPhonebookMember(
    @Headers('Authorization') authorization: string,
    @Param('phonebookId') phonebookId: number,
  ) {
    this.logger.verbose('Find phonebook member');
    const accessToken = authorization.split(' ')[1];
    const decodedAccessToken: any = jwt.decode(accessToken);
    const email = decodedAccessToken.email;
    const user = await this.usersService.checkUserInfo(email);
    return this.phonebookService.findPhonebookMember(user.userId, phonebookId);
  }

  // 주소록 멤버 삭제
  @Delete('/:phonebookId/:contactId')
  async deletePhonebookMember(
    @Headers('Authorization') authorization: string,
    @Param('phonebookId') phonebookId: number,
    @Param('contactId') contactId: number,
  ): Promise<object> {
    this.logger.verbose('Delete phonebook member');
    const accessToken = authorization.split(' ')[1];
    const decodedAccessToken: any = jwt.decode(accessToken);
    const email = decodedAccessToken.email;
    const user = await this.usersService.checkUserInfo(email);
    return this.phonebookService.deletePhonebookMember(
      user.userId,
      phonebookId,
      contactId,
    );
  }

  // 주소록 title 수정
  @Patch('/:phonebookId')
  async updatePhonebookTitle(
    @Headers('Authorization') authorization: string,
    @Param('phonebookId') phonebookId: number,
    @Body() updatePhonebookDto: UpdatePhonebookDto,
  ): Promise<object> {
    this.logger.verbose('Update phonebook title');
    const accessToken = authorization.split(' ')[1];
    const decodedAccessToken: any = jwt.decode(accessToken);
    const email = decodedAccessToken.email;
    const user = await this.usersService.checkUserInfo(email);
    const title = updatePhonebookDto.title;
    return this.phonebookService.updatePhonebookTitle(
      user.userId,
      phonebookId,
      title,
    );
  }

  // 주소록 멤버 추가
  @Post('/:phonebookId')
  async addPhonebookMember(
    @Headers('Authorization') authorization: string,
    @Param('phonebookId') phonebookId: number,
    @Body() addPhonebookMemberDto: AddPhonebookMemberDto,
  ) {
    this.logger.verbose('Add phonebook member');
    const accessToken = authorization.split(' ')[1];
    const decodedAccessToken: any = jwt.decode(accessToken);
    const email = decodedAccessToken.email;
    const user = await this.usersService.checkUserInfo(email);
    return this.phonebookService.addPhonebookMember(
      user.userId,
      phonebookId,
      addPhonebookMemberDto,
    );
  }
}
