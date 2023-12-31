import {
  Body,
  Controller,
  Get,
  NotFoundException,
  Post,
  Patch,
  Headers,
  Logger,
  UseGuards,
  Req,
} from '@nestjs/common';
import { UsersService } from '../service/users.service';
import { CreateUserDto } from '../dto/create-user.dto';
import { UpdateUserDto } from '../dto/update-user.dto';
import { UpdateHostnumberDto } from '../dto/update-hostnumber.dto';
import { UpdateBizserviceIdDto } from '../dto/update-bizserviceId.dto';
import * as jwt from 'jsonwebtoken';
import { UserBodyValidationPipe } from '../pipe/user-body-validation-pipe';
import { AuthGuard } from 'src/auth.guard';
import { UpdatePlusFriendDto } from '../dto/update-plusFriend.dto';
import {
  AccessTokenGuard,
  RefreshTokenGuard,
} from 'src/auth/guards/auth.guard';
import { ApiTags } from '@nestjs/swagger';

@Controller('users')
@ApiTags('Users API')
export class UsersController {
  private logger = new Logger('UsersController');
  constructor(private usersService: UsersService) {}

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

  @Post('/login')
  async loginUser(@Body('email') email: string): Promise<object> {
    this.logger.verbose('User login');
    return this.usersService.checkUserInfoWithToken(email);
  }

  @UseGuards(AccessTokenGuard)
  @Post('/refresh')
  async refresh(@Req() req) {
    this.logger.verbose('User refresh');
    const email = req.payload.email;
    const user = await this.usersService.checkUserInfo(email);
    const { accessToken: newAccessToken } =
      await this.usersService.generateTokens(user);
    return { accessToken: newAccessToken };
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

  @UseGuards(AccessTokenGuard)
  @Post('/logout')
  async logout(@Req() req) {
    this.logger.verbose('User logout');
    const email = req.payload.email;
    const user = await this.usersService.checkUserInfo(email);
    await this.usersService.logout(user);
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
        bizServiceId: userNcpInfo.bizServiceId,
        plusFriendIdList: userNcpInfo.plusFriendIdList,
        point: user.point,
        money: user.money,
      };
      return userInfo;
    } else {
      return { user };
    }
  }

  // 발신번호 수정
  @Patch('/me/hostnumber')
  async updateHostnumber(
    @Headers('Authorization') authorization: string,
    @Body() updateHostnumberDto: UpdateHostnumberDto,
  ): Promise<object> {
    this.logger.verbose('User hostnumber update');
    const accessToken = authorization.split(' ')[1];
    const decodedAccessToken: any = jwt.decode(accessToken);
    const email = decodedAccessToken.email;

    const user = await this.usersService.checkUserInfo(email);

    return await this.usersService.updateHostnumber(
      user.userId,
      updateHostnumberDto,
    );
  }

  // 발신번호와 메모 정보 가져오기
  @Get('/hostnumberdetail')
  async findHostnumberDetail(@Headers('Authorization') authorization: string) {
    this.logger.verbose('User hostnumber info');
    const accessToken = authorization.split(' ')[1];
    const decodedAccessToken: any = jwt.decode(accessToken);
    const email = decodedAccessToken.email;

    const user = await this.usersService.checkUserInfo(email);

    if (!user) {
      throw new NotFoundException('User not found!');
    }

    return await this.usersService.findHostnumberDetail(user.userId);
  }

  // bizmessage serviceId 입력
  @Patch('/me/bizserviceid')
  async updateBizserviceId(
    @Headers('Authorization') authorization: string,
    @Body() updateBizserviceIdDto: UpdateBizserviceIdDto,
  ) {
    this.logger.verbose('User bizserviceId update');
    const accessToken = authorization.split(' ')[1];
    const decodedAccessToken: any = jwt.decode(accessToken);
    const email = decodedAccessToken.email;

    const user = await this.usersService.checkUserInfo(email);

    if (!user) {
      throw new NotFoundException('User not found!');
    }

    return await this.usersService.updateBizserviceId(
      user.userId,
      updateBizserviceIdDto,
    );
  }

  // bizmessage plusFriendId와 메모 입력
  @Patch('/me/plusfriendid')
  async updatePlusFriendId(
    @Headers('Authorization') authorization: string,
    @Body() updatePlusFriendIdDto: UpdatePlusFriendDto,
  ) {
    this.logger.verbose('User plusFriendId update');
    const accessToken = authorization.split(' ')[1];
    const decodedAccessToken: any = jwt.decode(accessToken);
    const email = decodedAccessToken.email;

    const user = await this.usersService.checkUserInfo(email);

    if (!user) {
      throw new NotFoundException('User not found!');
    }

    return await this.usersService.updatePlusFriendId(
      user.userId,
      updatePlusFriendIdDto,
    );
  }
}
