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
      const userInfo = {
        userId: user.userId,
        email: user.email,
        name: user.name,
        hostnumber: user.hostnumber,
        advertisementOpt: user.advertisementOpt,
        advertiseNumber: userNcpInfo.advertiseNumber,
        accessKey: userNcpInfo.accessKey,
        serviceId: userNcpInfo.serviceId,
        secretKey: userNcpInfo.secretKey,
        point: user.point,
        money: user.money,
      };
      return userInfo;
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

  // @Post('/phonebook')
  // async createPhonebook(
  //   @Body() createPhonebookDto: CreatePhonebookDto,
  //   @Headers('Authorization') authorization: string,
  // ) {
  //   this.logger.verbose('User create phonebook');

  //   const accessToken = authorization.split(' ')[1];
  //   const decodedAccessToken: any = jwt.decode(accessToken);

  //   const email = decodedAccessToken.email;

  //   const user = await this.usersService.checkUserInfo(email);

  //   return this.usersService.createPhonebook(user, createPhonebookDto);
  // }

  // @Get('/allContacts')
  // async findAllContacts(@Headers('Authorization') authorization: string) {
  //   this.logger.verbose('User all contacts');

  //   const accessToken = authorization.split(' ')[1];
  //   const decodedAccessToken: any = jwt.decode(accessToken);

  //   const email = decodedAccessToken.email;

  //   const user = await this.usersService.checkUserInfo(email);

  //   return this.usersService.findAllContacts();
  // }
}
