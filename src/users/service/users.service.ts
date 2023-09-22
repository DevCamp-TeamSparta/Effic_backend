import {
  Injectable,
  NotFoundException,
  HttpException,
  HttpStatus,
  UnauthorizedException,
} from '@nestjs/common';
import { EntityManager } from 'typeorm';
import { UserNcpInfoRepository, UsersRepository } from '../users.repository';
import { InjectEntityManager } from '@nestjs/typeorm';
import { User, HostnumberDetail } from '../user.entity';
import * as jwt from 'jsonwebtoken';
import { jwtConfig } from '../../../config/jwt.config';
import { UpdateUserDto } from '../dto/update-user.dto';
import { UpdateHostnumberDto } from '../dto/update-hostnumber.dto';
import {
  NCP_BizMessage_price,
  NCP_SMS_price,
} from '../../../commons/constants';

@Injectable()
export class UsersService {
  constructor(
    private readonly usersRepository: UsersRepository,
    private readonly userNcpInfoRepository: UserNcpInfoRepository,
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
      console.error(error);
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
    advertiseNumber: string[],
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
    } else {
      const user = await this.usersRepository.createUser(newUser);
      await this.userNcpInfoRepository.saveNcpInfo(user, newUser);
    }
  }

  // 회원정보 수정
  async updateUser(
    email: string,
    accessToken: string,
    updateUserDto: UpdateUserDto,
  ) {
    const user = await this.usersRepository.findOneByEmail(email);

    if (!user) {
      throw new NotFoundException('User not found');
    }

    await this.checkAccessToken(user, accessToken);

    Object.assign(user, updateUserDto);

    if (updateUserDto.advertiseNumber) {
      await this.userNcpInfoRepository.updateNcpInfo(
        user.userId,
        updateUserDto,
      );
    }

    if (updateUserDto.hostnumber) {
      await this.usersRepository.updateUser(user.userId, updateUserDto);
      await this.userNcpInfoRepository.updateNcpInfo(
        user.userId,
        updateUserDto,
      );
    }

    if (updateUserDto.name || updateUserDto.advertisementOpt) {
      await this.usersRepository.updateUser(user.userId, updateUserDto);
    }

    if (
      updateUserDto.accessKey ||
      updateUserDto.serviceId ||
      updateUserDto.secretKey
    ) {
      await this.userNcpInfoRepository.updateNcpInfo(
        user.userId,
        updateUserDto,
      );
    }
  }

  // 로그아웃
  async logout(user: User) {
    user.refreshToken = null;
    await this.usersRepository.logout(user);
  }

  // 마이페이지
  async findUserNcpInfo(userId: number) {
    const userNcpInfo = await this.userNcpInfoRepository.findOneByUserId(
      userId,
    );

    return userNcpInfo;
  }

  // 발신번호 수정
  async updateHostnumber(
    userId: number,
    updateHostnumberDto: UpdateHostnumberDto,
  ) {
    const { hostnumberwithmemo } = updateHostnumberDto;
    const hostnumber = hostnumberwithmemo.map((info) => info.hostnumber);

    const user = await this.usersRepository.findOneByUserId(userId);
    const userNcpInfo = await this.userNcpInfoRepository.findOneByUserId(
      userId,
    );

    if (!user || !userNcpInfo) {
      throw new NotFoundException('User not found');
    }

    user.hostnumber = hostnumber;
    userNcpInfo.hostnumber = hostnumber;

    await this.usersRepository.save(user);
    await this.userNcpInfoRepository.save(userNcpInfo);

    const hostnumberDelete = await this.entityManager.find(HostnumberDetail, {
      where: { userId },
    });
    if (hostnumberDelete) {
      await this.entityManager.remove(hostnumberDelete);
    }

    for (let i = 0; i < hostnumberwithmemo.length; i++) {
      const hostnumberDetail = new HostnumberDetail();
      hostnumberDetail.hostnumber = hostnumberwithmemo[i].hostnumber;
      hostnumberDetail.memo = hostnumberwithmemo[i].memo;
      hostnumberDetail.userId = userId;
      await this.entityManager.save(hostnumberDetail);
    }

    const hostnumberDetails = await this.entityManager.find(HostnumberDetail, {
      where: { userId },
    });

    return hostnumberDetails;
  }

  // 발신번호와 메모 정보 가져오기
  async findHostnumberDetail(userId: number) {
    const hostnumberDetails = await this.entityManager.find(HostnumberDetail, {
      where: { userId },
    });

    return hostnumberDetails;
  }

  // bizserviceId 존재유무 확인
  async checkBizserviceId(email: string) {
    const user = await this.usersRepository.findOneByEmail(email);

    const userNcpInfo = await this.userNcpInfoRepository.findOneByUserId(
      user.userId,
    );

    if (!userNcpInfo) {
      throw new NotFoundException('User not found');
    }

    const bizServiceId = userNcpInfo.bizServiceId;

    if (bizServiceId === '') {
      throw new HttpException(
        'BizServiceId is not provided',
        HttpStatus.BAD_REQUEST,
      );
    }

    return { userId: user.userId, bizServiceId };
  }

  // 유저 금액 확인 (message)
  async assertCheckUserMoney(userId: number, count: number) {
    const user = await this.usersRepository.findOneByUserId(userId);

    const totalMoney = user.point + user.money;

    if (totalMoney < count * NCP_SMS_price) {
      const requiredPoints = count * NCP_SMS_price - totalMoney;
      throw new HttpException(
        `User does not have enough money. Please charge your money. need ${requiredPoints} points`,
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  // 유저 금액 확인 (bizmessage)
  async assertCheckUserMoneyForBiz(userId: number, count: number) {
    const user = await this.usersRepository.findOneByUserId(userId);

    const totalMoney = user.point + user.money;

    if (totalMoney < count * NCP_BizMessage_price) {
      const requiredPoints = count * NCP_BizMessage_price - totalMoney;
      throw new HttpException(
        `User does not have enough money. Please charge your money. need ${requiredPoints} points`,
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  // 유저의 info 가져오기
  async findUserByUserId(userId: number) {
    const user = await this.usersRepository.findOneByUserId(userId);
    return user;
  }

  // 유저의 NcpInfo 가져오기
  async findUserNcpInfoByUserId(userId: number) {
    const userNcpInfo = await this.userNcpInfoRepository.findOneByUserId(
      userId,
    );
    return userNcpInfo;
  }

  // bizmessage serviceId 입력
  async updateBizserviceId(userId: number, updateBizserviceIdDto) {
    const userNcpInfo = await this.userNcpInfoRepository.findOneByUserId(
      userId,
    );

    if (!userNcpInfo) {
      throw new NotFoundException('User not found');
    }

    if (userNcpInfo.bizServiceId !== '') {
      throw new HttpException(
        'BizServiceId is already provided',
        HttpStatus.BAD_REQUEST,
      );
    }

    userNcpInfo.bizServiceId = null;
    userNcpInfo.bizServiceId = updateBizserviceIdDto.bizServiceId;

    await this.userNcpInfoRepository.save(userNcpInfo);

    return userNcpInfo;
  }
}
