import {
  Body,
  Controller,
  Get,
  NotFoundException,
  Post,
  Patch,
  Headers,
  Logger,
} from '@nestjs/common';
import { UsersService } from '../service/users.service';
import { CreateUserDto } from '../dto/create-user.dto';
import { UpdateUserDto } from '../dto/update-user.dto';
import * as jwt from 'jsonwebtoken';
import { UserBodyValidationPipe } from '../pipe/user-body-validation-pipe';
import { CreatePhonebookDto } from '../dto/create-phonebook.dto';

@Controller('users')
export class UsersController {
  private logger = new Logger('UsersController');
  constructor(private usersService: UsersService) {}

  @Post('/login')
  async loginUser(@Body() createUserDto: CreateUserDto): Promise<object> {
    this.logger.verbose('User login');
    return this.usersService.checkUserInfoWithToken(createUserDto);
  }

  @Post('/refresh')
  async refresh(@Headers('Authorization') authorization: string) {
    this.logger.verbose('User refresh');
    const accessToken = authorization.split(' ')[1];
    const decodedAccessToken: any = jwt.decode(accessToken);
    const email = decodedAccessToken.email;
    const user = await this.usersService.checkUserInfo(email);
    const { accessToken: newAccessToken } =
      await this.usersService.generateTokens(user);
    return { accessToken: newAccessToken };
  }

  @Post('/signup')
  async createUser(
    @Body(new UserBodyValidationPipe()) createUserDto: CreateUserDto,
    @Headers('Authorization') authorization: string,
  ): Promise<object> {
    this.logger.verbose('User signup');

    const Token = authorization.split(' ')[1];

    const {
      email,
      name,
      hostnumber,
      accessKey,
      serviceId,
      secretKey,
      advertisementOpt,
      advertiseNumber,
      point,
    } = createUserDto;

    await this.usersService.createUser(
      Token,
      email,
      name,
      hostnumber,
      accessKey,
      serviceId,
      secretKey,
      advertisementOpt,
      advertiseNumber,
      point,
    );

    const user = await this.usersService.checkUserInfo(email);
    const { accessToken, refreshToken } =
      await this.usersService.generateTokens(user);
    await this.usersService.saveRefreshToken(user, refreshToken);

    return {
      email,
      name,
      hostnumber,
      accessKey,
      serviceId,
      secretKey,
      advertisementOpt,
      advertiseNumber,
      accessToken,
      point,
    };
  }

  @Patch('/me')
  async updateUser(
    @Headers('Authorization') authorization: string,
    @Body(new UserBodyValidationPipe()) updateUserDto: UpdateUserDto,
  ) {
    this.logger.verbose('User update');
    const accessToken = authorization.split(' ')[1];
    const decodedAccessToken: any = jwt.decode(accessToken);
    const email = decodedAccessToken.email;
    await this.usersService.updateUser(email, authorization, updateUserDto);
  }

  @Post('/logout')
  async logout(@Headers('Authorization') authorization: string) {
    this.logger.verbose('User logout');
    const accessToken = authorization.split(' ')[1];
    const decodedAccessToken: any = jwt.decode(accessToken);

    if (decodedAccessToken) {
      const user = await this.usersService.checkUserInfo(
        decodedAccessToken.email,
      );
      await this.usersService.logout(user);
    }
  }

  // 마이페이지
  @Get('/me')
  async findUser(@Headers('Authorization') authorization: string) {
    this.logger.verbose('User info');

    const accessToken = authorization.split(' ')[1];
    const decodedAccessToken: any = jwt.decode(accessToken);

    const email = decodedAccessToken.email;

    const user = await this.usersService.checkUserInfo(email);

    if (!user) {
      throw new NotFoundException('User not found!');
    }

    const userNcpInfo = await this.usersService.findUserNcpInfo(user.userId);

    if (userNcpInfo) {
      return { user, userNcpInfo };
    } else {
      return { user };
    }
  }

  // 한명의 유저가 여러개의 전화번호부를 가질 수 있음
  // 전화번호부는 유저가 생성할 수 있음
  // 각 전화번호부에는 제목, 이름, 전화번호, id가 들어가야함
  // 각 전화번호부에는 중복된 이름/전화번호가 들어갈 수 없음
  // 전화번호부는 유저가 삭제 및 수정할 수 있음
  // 주소록에는 각 전화번호부의 제목, id가 들어가야함
  // 주소록 id 1번은 각 전화번호부에서 이름과 전화번호를 가져오고, 중복된 값은 한번만 가져옴

  // 전화번호부 생성
  // 전화번호부의 구성 예시
  // title: '점심식사 초청 명단', [{name: '김철수', number: '01012345678'}, {name: '김영희', number: '01087654321'}]
  // title: '저녁식사 초청 명단', [{name: '김철희', number: '01099889788'}, {name: '김영희', number: '01087654321'}]
  // AllContacts db에 저장되는 구성 예시
  // contactId: 1, name: '김철수', number: '01012345678', userId: 1
  // contactId: 2, name: '김영희', number: '01087654321', userId: 1
  // contactId: 3, name: '김철희', number: '01099889788', userId: 1
  // PhonebookList db에 저장되는 구성 예시
  // phonebookId: 1, title: Total, member: [phonebookId1, phonebookId2, phonebookId3], userId: 1
  // phonebookId: 2, title: '점심식사 초청 명단', members: [phonebookId1, phonebookId2], userId: 1
  // phonebookId: 3, title: '저녁식사 초청 명단', members: [phonebookId2, phonebookId3], userId: 1
  // @Post('/phonebook')
  // async createPhonebook(
  //   @Body() createPhonebookDto: CreatePhonebookDto,
  //   @Headers('Authorization') authorization: string,
  // ) {
  //   this.logger.verbose('Create phonebook');
  //   const accessToken = authorization.split(' ')[1];
  //   const decodedAccessToken: any = jwt.decode(accessToken);
  //   const email = decodedAccessToken.email;
  //   const user = await this.usersService.checkUserInfo(email);
  //   return this.usersService.createPhonebook(user.userId, createPhonebookDto);
  // }

  // @Patch('/phonebook')
  // async updatePhonebook(
  //   @Body() createPhonebookDto: CreatePhonebookDto,
  //   @Headers('Authorization') authorization: string,
  // ) {
  //   this.logger.verbose('Update phonebook');
  //   const accessToken = authorization.split(' ')[1];
  //   const decodedAccessToken: any = jwt.decode(accessToken);
  //   const email = decodedAccessToken.email;
  //   const user = await this.usersService.checkUserInfo(email);
  //   return this.usersService.updatePhonebook(user.userId, createPhonebookDto);
  // }

  // @Get('/AllContacts')
  // async findAllContacts(@Headers('Authorization') authorization: string) {
  //   this.logger.verbose('Find all contacts');
  //   const accessToken = authorization.split(' ')[1];
  //   const decodedAccessToken: any = jwt.decode(accessToken);
  //   const email = decodedAccessToken.email;
  //   const user = await this.usersService.checkUserInfo(email);
  //   return this.usersService.findAllContacts(user.userId);
  // }
}
