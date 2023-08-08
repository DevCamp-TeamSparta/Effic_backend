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
    await this.usersService.checkUserInfo(email);
    return { email };
  }

  @Post('/signup')
  async createUser(@Body() createUserDto: CreateUserDto) {
    const { email, name, number, access_key, service_id } = createUserDto;
    await this.usersService.createUser(
      email,
      name,
      number,
      access_key,
      service_id,
    );
    return { email, name, number, access_key, service_id };
  }

  @Patch('/:user_id')
  async updateUser(
    @Param('user_id') user_id: string,
    @Body() updateUserDto: UpdateUserDto,
  ) {
    await this.usersService.updateUser(parseInt(user_id), updateUserDto);
  }

  // 마이페이지
  @Get('/:user_id')
  async findUser(@Param('user_id') user_id: string) {
    const user = await this.usersService.findUser(parseInt(user_id));
    if (!user) {
      throw new NotFoundException('user not found!');
    }
    return user;
  }
}
