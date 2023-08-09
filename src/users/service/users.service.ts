import {
  Injectable,
  NotFoundException,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from '../user.entity';
import * as jwt from 'jsonwebtoken';
import { jwtConfig } from '../../../config/jwt.config';

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
    return user;
  }

  generateAccessToken(user: User) {
    const accessToken = jwt.sign(
      { userId: user.userId, email: user.email },
      jwtConfig.secretKey,
      {
        expiresIn: jwtConfig.accessTokenExpiresIn,
      },
    );
    return accessToken;
  }

  generateRefreshToken(user: User) {
    const refreshToken = jwt.sign(
      { userId: user.userId, email: user.email },
      jwtConfig.refreshTokenSecretKey,
      {
        expiresIn: jwtConfig.refreshTokenExpiresIn,
      },
    );
    return refreshToken;
  }

  async saveRefreshToken(user: User, refreshToken: string) {
    user.refreshToken = refreshToken;
    await this.repo.save(user);
  }

  // 회원가입.
  async createUser(
    email: string,
    name: string,
    number: string[],
    accessKey: string,
    serviceId: string,
  ) {
    const user = await this.repo.findOne({ where: { email } });
    const newUser = { email, name, number, accessKey, serviceId };
    if (user) {
      throw new HttpException('User already exists', HttpStatus.BAD_REQUEST);
      return;
    } else {
      await this.repo.save(newUser);
    }
  }

  // 회원정보 수정
  async updateUser(userId: number, updateUserDto: Partial<User>) {
    const user = await this.repo.findOne({ where: { userId } });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    Object.assign(user, updateUserDto);

    if (updateUserDto.email) {
      throw new HttpException('Cannot change email', HttpStatus.BAD_REQUEST);
    }

    return await this.repo.save(user);
  }

  // 마이페이지
  async findUser(userId: number) {
    return this.repo.findOne({ where: { userId } });
  }
}
