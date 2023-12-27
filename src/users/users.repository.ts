import { Injectable } from '@nestjs/common';
import { User, UserNcpInfo } from './user.entity';
import { Repository, DataSource } from 'typeorm';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UsersRepository extends Repository<User> {
  constructor(private datasource: DataSource) {
    super(User, datasource.createEntityManager());
  }

  async findOneByEmail(email: string): Promise<User | undefined> {
    return await this.findOne({ where: { email } });
  }

  async saveRefreshToken(user: User): Promise<User> {
    return await this.save(user);
  }

  async createUser(createUSerInfo: CreateUserDto): Promise<User> {
    const { email, name, hostnumber, advertisementOpt } = createUSerInfo;

    const extractedHostnumbers = hostnumber.map((hostnumber) =>
      hostnumber.replace(/\D/g, ''),
    );

    const addedPoint = 3000;
    const newUser = this.create({
      email: email,
      name: name,
      hostnumber: extractedHostnumbers,
      isNcp: true, // 추후에 ncp가 아닌 다른서비스를 이용할 경우 변경해야함
      advertisementOpt: advertisementOpt,
      point: addedPoint,
    });

    return await this.save(newUser);
  }

  async findOneByUserId(userId: number): Promise<User> {
    return await this.findOne({ where: { userId } });
  }

  async findAllHostnumber(): Promise<User[]> {
    return await this.find({ select: ['hostnumber'] });
  }

  async updateUser(
    userID: number,
    updateUserInfo: UpdateUserDto,
  ): Promise<User> {
    const user = await this.findOneByUserId(userID);
    for (const field in updateUserInfo) {
      if (updateUserInfo.hasOwnProperty(field)) {
        user[field] = updateUserInfo[field];
      }
    }
    return await this.save(user);
  }

  async logout(user: User): Promise<User> {
    user.refreshToken = null;
    return await this.save(user);
  }
}

@Injectable()
export class UserNcpInfoRepository extends Repository<UserNcpInfo> {
  constructor(private datasource: DataSource) {
    super(UserNcpInfo, datasource.createEntityManager());
  }

  async saveNcpInfo(
    userId,
    createUSerInfo: CreateUserDto,
  ): Promise<UserNcpInfo> {
    const { accessKey, serviceId, secretKey, advertiseNumber, hostnumber } =
      createUSerInfo;

    const extractedHostnumbers = hostnumber.map((hostnumber) =>
      hostnumber.replace(/\D/g, ''),
    );

    const newUserNcpInfo = this.create({
      accessKey: accessKey,
      serviceId: serviceId,
      secretKey: secretKey,
      advertiseNumber: advertiseNumber,
      hostnumber: extractedHostnumbers,
      userId: userId.userId,
    });

    return await this.save(newUserNcpInfo);
  }

  async findOneByUserId(userId: number): Promise<UserNcpInfo> {
    return await this.findOne({ where: { userId } });
  }

  async updateNcpInfo(userId: number, updateUserDto) {
    const user = await this.findOneByUserId(userId);
    for (const field in updateUserDto) {
      if (updateUserDto.hasOwnProperty(field)) {
        user[field] = updateUserDto[field];
      }
    }
    return await this.save(user);
  }
}
