import {
  Body,
  Controller,
  Get,
  NotFoundException,
  Param,
  Post,
  Patch,
} from '@nestjs/common';
import { CreateUserDto } from '../dto/create-user.dto';
import { UsersService } from '../service/users.service';
import { UpdateUserDto } from '../dto/update-user.dto';

@Controller('users')
export class UsersController {
  constructor(private usersService: UsersService) {}

  @Post('/login')
  async checkUserInfo(@Body() createUserDto: CreateUserDto) {
    const email = createUserDto.email;
    const user = await this.usersService.checkUserInfo(email);

    const accessToken = this.usersService.generateAccessToken(user);
    const refreshToken = this.usersService.generateRefreshToken(user);
    await this.usersService.saveRefreshToken(user, refreshToken);

    return { email, accessToken };
  }

  @Post('/signup')
  async createUser(@Body() createUserDto: CreateUserDto) {
    const { email, name, number, accessKey, serviceId } = createUserDto;
    await this.usersService.createUser(
      email,
      name,
      number,
      accessKey,
      serviceId,
    );
    return { email, name, number, accessKey, serviceId };
  }

  @Patch('/:userId')
  async updateUser(
    @Param('userId') userId: string,
    @Body() updateUserDto: UpdateUserDto,
  ) {
    await this.usersService.updateUser(parseInt(userId), updateUserDto);
  }

  // 마이페이지
  @Get('/:userId')
  async findUser(@Param('userId') userId: string) {
    const user = await this.usersService.findUser(parseInt(userId));
    if (!user) {
      throw new NotFoundException('User not found!');
    }
    return user;
  }
}
