import {
  Injectable,
  NotFoundException,
  HttpException,
  HttpStatus,
  UnauthorizedException,
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
      throw new NotFoundException('User not found');
    }
    return user;
  }

  async checkUserInfoWithToken(createUserDto) {
    const email = createUserDto.email;

    try {
      const user = await this.checkUserInfo(email);

      const { accessToken, refreshToken } = await this.generateTokens(user);
      await this.saveRefreshToken(user, refreshToken);

      return { email, accessToken };
    } catch (error) {
      if (error instanceof NotFoundException) {
        const dummyUser = new User();
        const { accessToken } = await this.generateTokens(dummyUser);
        return { message: 'User not found', accessToken };
      }
      throw new HttpException(
        'Internal server error',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  // 토큰생성
  async generateTokens(
    user: User,
  ): Promise<{ accessToken: string; refreshToken: string }> {
    const accessToken = jwt.sign(
      { userId: user.userId, email: user.email },
      jwtConfig.secretKey,
      {
        expiresIn: jwtConfig.accessTokenExpiresIn,
      },
    );

    const refreshToken = jwt.sign(
      { userId: user.userId, email: user.email },
      jwtConfig.refreshTokenSecretKey,
      {
        expiresIn: jwtConfig.refreshTokenExpiresIn,
      },
    );

    return { accessToken, refreshToken };
  }

  async saveRefreshToken(user: User, refreshToken: string) {
    user.refreshToken = refreshToken;
    await this.repo.save(user);
  }

  // 엑세스토큰 확인
  async checkAccessToken(user: User, accessToken: string) {
    if (accessToken === undefined) {
      throw new UnauthorizedException('Access token is not provided');
    } else {
      const Token = accessToken.split(' ')[1];
      const decodedAccessToken: any = jwt.decode(Token);
      if (decodedAccessToken && decodedAccessToken.exp * 1000 > Date.now()) {
        return;
      } else {
        const decodedRefreshToken: any = jwt.decode(user.refreshToken);
        if (
          decodedRefreshToken &&
          decodedRefreshToken.exp * 1000 > Date.now()
        ) {
          if (decodedRefreshToken === user.refreshToken) {
            const { accessToken, refreshToken } = await this.generateTokens(
              user,
            );
            throw new HttpException(
              { Message: 'Access token is invalid or expired', accessToken },
              HttpStatus.FORBIDDEN,
            );
          } else {
            throw new UnauthorizedException('Tokens are invalid!');
          }
        } else {
          throw new UnauthorizedException('Tokens are invalid');
        }
      }
    }
  }

  // 회원가입
  async createUser(
    headerEmail: string,
    email: string,
    name: string,
    number: string[],
    accessKey: string,
    serviceId: string,
    advertisementOpt: boolean,
  ) {
    if (headerEmail !== email) {
      throw new HttpException('Email is not valid', HttpStatus.BAD_REQUEST);
    }
    const user = await this.repo.findOne({ where: { email } });
    const newUser = {
      email,
      name,
      number,
      accessKey,
      serviceId,
      advertisementOpt,
    };
    if (user) {
      throw new HttpException('User already exists', HttpStatus.BAD_REQUEST);
      return;
    } else {
      await this.repo.save(newUser);
    }
  }

  // 회원정보 수정
  async updateUser(
    userId: number,
    accessToken: string,
    updateUserDto: Partial<User>,
  ) {
    const user = await this.repo.findOne({ where: { userId } });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    await this.checkAccessToken(user, accessToken);

    Object.assign(user, updateUserDto);

    if (updateUserDto.email) {
      throw new HttpException('Cannot change email', HttpStatus.BAD_REQUEST);
    }

    return await this.repo.save(user);
  }

  async logout(user: User) {
    user.refreshToken = null;
    await this.repo.save(user);
  }

  // 마이페이지
  async findUser(userId: number) {
    return this.repo.findOne({ where: { userId } });
  }
}
