import {
  Injectable,
  NotFoundException,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from '../user.entity';

@Injectable()
export class UsersService {
  constructor(@InjectRepository(User) private repo: Repository<User>) {}

  // 로그인
  async checkUserInfo(email: string) {
    const user = await this.repo.findOne({ where: { email } });
    if (!user) {
      throw new NotFoundException({
        message: 'User not found',
        accessToken: email,
      });
    }
  }

  // 회원가입
  async createUser(
    email: string,
    name: string,
    number: string[],
    access_key: string,
    service_id: string,
  ) {
    const user = await this.repo.findOne({ where: { email } });
    const newUser = { email, name, number, access_key, service_id };
    if (user) {
      throw new HttpException('User already exists', HttpStatus.BAD_REQUEST);
      return;
    } else {
      await this.repo.save(newUser);
    }
  }

  // 회원정보 수정
  async updateUser(user_id: number, updateUserDto: Partial<User>) {
    const user = await this.repo.findOne({ where: { user_id } });
    if (!user) {
      throw new NotFoundException('user not found');
    }
    if (updateUserDto.name) {
      user.name = updateUserDto.name;
    }
    if (updateUserDto.number) {
      user.number = updateUserDto.number;
    }
    if (updateUserDto.access_key) {
      user.access_key = updateUserDto.access_key;
    }
    if (updateUserDto.service_id) {
      user.service_id = updateUserDto.service_id;
    }
    if (updateUserDto.email) {
      throw new HttpException('Cannot change email', HttpStatus.BAD_REQUEST);
    }
    return await this.repo.save(user);
  }

  // 마이페이지
  async findUser(user_id: number) {
    return this.repo.findOne({ where: { user_id } });
  }
}
