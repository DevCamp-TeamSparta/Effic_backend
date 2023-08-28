import {
  Injectable,
  NotFoundException,
  HttpException,
  HttpStatus,
  UnauthorizedException,
} from '@nestjs/common';
import { EntityManager } from 'typeorm';
import { UsersRepository } from '../users.repository';
import { InjectEntityManager } from '@nestjs/typeorm';
import { User } from '../user.entity';
import * as jwt from 'jsonwebtoken';
import { jwtConfig } from '../../../config/jwt.config';

@Injectable()
export class UsersService {
  constructor(
    private readonly usersRepository: UsersRepository,
    @InjectEntityManager() private readonly entityManager: EntityManager,
  ) {}

  // 로그인
  async checkUserInfo(email: string) {
    const user = await this.usersRepository.findOneByEmail(email);
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
        dummyUser.email = email;
        const { accessToken } = await this.generateTokens(dummyUser);
        throw new HttpException(
          { message: 'User not found', accessToken },
          HttpStatus.NOT_FOUND,
        );
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
    await this.usersRepository.saveRefreshToken(user);
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
        if (!user) {
          throw new HttpException(
            { Message: 'Access token is invalid or expired', accessToken },
            HttpStatus.FORBIDDEN,
          );
        }
        const decodedRefreshToken: any = jwt.decode(user.refreshToken);
        if (
          decodedRefreshToken &&
          decodedRefreshToken.exp * 1000 > Date.now()
        ) {
          const { accessToken } = await this.generateTokens(user);
          throw new HttpException(
            { Message: 'Access token is invalid or expired', accessToken },
            HttpStatus.FORBIDDEN,
          );
        } else {
          throw new UnauthorizedException('Tokens are invalid');
        }
      }
    }
  }

  // 회원가입
  async createUser(
    token: string,
    email: string,
    name: string,
    hostnumber: string[],
    accessKey: string,
    serviceId: string,
    secretKey: string,
    advertisementOpt: boolean,
    advertiseNumber: number,
    point: number,
  ) {
    this.checkAccessToken(null, `Bearer ${token}`);
    const payload = jwt.decode(token);
    if (typeof payload === 'string') {
      throw new HttpException('Token is not valid', HttpStatus.BAD_REQUEST);
    }
    const headerEmail = payload.email;
    if (headerEmail !== email) {
      throw new HttpException('Email is not valid', HttpStatus.BAD_REQUEST);
    }
    const user = await this.usersRepository.findOneByEmail(email);
    const newUser = {
      email,
      name,
      hostnumber,
      accessKey,
      serviceId,
      secretKey,
      advertisementOpt,
      advertiseNumber,
      point,
    };
    if (user) {
      throw new HttpException('User already exists', HttpStatus.BAD_REQUEST);
      return;
    } else {
      await this.usersRepository.createUser(newUser);
    }
  }

  // 회원정보 수정
  async updateUser(
    userId: number,
    accessToken: string,
    updateUserDto: Partial<User>,
  ) {
    const user = await this.usersRepository.findOneByUserId(userId);

    if (!user) {
      throw new NotFoundException('User not found');
    }

    await this.checkAccessToken(user, accessToken);

    Object.assign(user, updateUserDto);

    if (updateUserDto.email) {
      throw new HttpException('Cannot change email', HttpStatus.BAD_REQUEST);
    }

    return await this.usersRepository.updateUser(userId, updateUserDto);
  }

  async logout(user: User) {
    user.refreshToken = null;
    await this.usersRepository.logout(user);
  }

  // 마이페이지
  async findUser(userId: number) {
    return this.usersRepository.findOneByUserId(userId);
  }
}
