import {
  Body,
  Controller,
  Get,
  NotFoundException,
  Param,
  Post,
  Patch,
  Headers,
} from '@nestjs/common';
import { UsersService } from '../service/users.service';
import { CreateUserDto } from '../dto/create-user.dto';
import { UpdateUserDto } from '../dto/update-user.dto';
import * as jwt from 'jsonwebtoken';

@Controller('users')
export class UsersController {
  constructor(private usersService: UsersService) {}

  @Post('/login')
  async loginUser(@Body() createUserDto: CreateUserDto) {
    return this.usersService.checkUserInfoWithToken(createUserDto);
  }

  @Post('/signup')
  async createUser(
    @Body() createUserDto: CreateUserDto,
    @Headers('email') headerEmail: string,
  ) {
    const { email, name, hostnumber, accessKey, serviceId, advertisementOpt } =
      createUserDto;

    await this.usersService.createUser(
      headerEmail,
      email,
      name,
      hostnumber,
      accessKey,
      serviceId,
      advertisementOpt,
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
      advertisementOpt,
      accessToken,
    };
  }

  @Patch('/:userId')
  async updateUser(
    @Param('userId') userId: string,
    @Headers('authorization') authorization: string,
    @Body() updateUserDto: UpdateUserDto,
  ) {
    await this.usersService.updateUser(
      parseInt(userId),
      authorization,
      updateUserDto,
    );
  }

  @Post('/logout')
  async logout(@Headers('authorization') authorization: string) {
    const accessToken = authorization.split(' ')[1];
    const decodedAccessToken: any = jwt.decode(accessToken);

    if (decodedAccessToken) {
      const user = await this.usersService.checkUserInfo(
        decodedAccessToken.email,
      );
      await this.usersService.logout(user);
    }
  }

  // 마이페이지.
  @Get('/:userId')
  async findUser(@Param('userId') userId: string) {
    const user = await this.usersService.findUser(parseInt(userId));
    if (!user) {
      throw new NotFoundException('User not found!');
    }
    return user;
  }
}
