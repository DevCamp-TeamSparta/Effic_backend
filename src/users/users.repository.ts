import { Injectable } from '@nestjs/common';
import { User } from './user.entity';
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
    const {
      email,
      name,
      hostnumber,
      accessKey,
      serviceId,
      secretKey,
      advertisementOpt,
      advertiseNumber,
    } = createUSerInfo;

    const extractedHostnumbers = hostnumber.map((hostnumber) =>
      hostnumber.replace(/\D/g, ''),
    );

    const addedPoint = 3000;
    const newUser = this.create({
      email: email,
      name: name,
      hostnumber: extractedHostnumbers,
      accessKey: accessKey,
      serviceId: serviceId,
      secretKey: secretKey,
      advertisementOpt: advertisementOpt,
      advertiseNumber: advertiseNumber,
      point: addedPoint,
    });
    return await this.save(newUser);
  }

  async findOneByUserId(userId: number): Promise<User> {
    return await this.findOne({ where: { userId } });
  }

  async findOneByHostNumber(hostnumber: string): Promise<User | undefined> {
    return await this.findOne({ where: { hostnumber } });
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
