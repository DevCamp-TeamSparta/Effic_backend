import {
  Injectable,
  NotFoundException,
  HttpException,
  HttpStatus,
  UnauthorizedException,
} from '@nestjs/common';
import { EntityManager } from 'typeorm';
import {
  UserNcpInfoRepository,
  UsersRepository,
  AllContactsRepository,
  PhonebookListRepository,
} from '../users.repository';
import { AllContacts } from '../user.entity';
import { InjectEntityManager } from '@nestjs/typeorm';
import { User } from '../user.entity';
import * as jwt from 'jsonwebtoken';
import { jwtConfig } from '../../../config/jwt.config';
import { UpdateUserDto } from '../dto/update-user.dto';

@Injectable()
export class UsersService {
  constructor(
    private readonly usersRepository: UsersRepository,
    private readonly userNcpInfoRepository: UserNcpInfoRepository,
    private readonly allCantactsRepository: AllContactsRepository,
    private readonly phonebookListRepository: PhonebookListRepository,
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

  // 주소록 생성
  async createPhonebook(userId: number, createPhonebookDto) {
    const { title, members } = createPhonebookDto;

    // 같은 title이 있으면 에러
    const Phonebook = await this.entityManager.findOne('PhonebookList', {
      where: {
        userId: userId,
        title: title,
      },
    });

    if (Phonebook) {
      throw new HttpException(
        'Phonebook already exists',
        HttpStatus.BAD_REQUEST,
      );
    }

    // 이미 멤버가 있는지 확인
    const memberList = [];
    for (let i = 0; i < members.length; i++) {
      const Contact =
        await this.allCantactsRepository.findOneByUserIdAndNameAndPhoneNumber(
          userId,
          members[i].name,
          members[i].number,
        );

      if (!Contact) {
        const newContact = new AllContacts();
        newContact.name = members[i].name;
        newContact.number = members[i].number;
        newContact.userId = userId;

        await this.entityManager.save(newContact);
        memberList.push(newContact.contactId);
      } else {
        memberList.push(Contact.contactId);
      }
    }

    const PhonebookList = this.entityManager.create('PhonebookList', {
      title: title,
      members: memberList,
      userId: userId,
      createdAt: new Date(),
    });

    await this.entityManager.save(PhonebookList);

    return PhonebookList;
  }

  // 주소록 멤버 수정
  async updatePhonebook(
    userId: number,
    phonebookId: number,
    contactId: number,
    updatePhonebookDto,
  ) {
    const contact = await this.entityManager.findOne('AllContacts', {
      where: {
        contactId: contactId,
        userId: userId,
      },
    });

    if (!contact) {
      throw new HttpException('Contact not found', HttpStatus.NOT_FOUND);
    }

    const Phonebook = await this.phonebookListRepository.findOneByPhonebookId(
      phonebookId,
    );

    if (!Phonebook) {
      throw new HttpException('Phonebook not found', HttpStatus.NOT_FOUND);
    }

    const { name, number } = updatePhonebookDto;

    const Contact = await this.allCantactsRepository.findOneByContactId(
      contactId,
    );

    if (name && number) {
      Contact.name = name;
      Contact.number = number;
    } else if (name) {
      Contact.name = name;
    } else if (number) {
      Contact.number = number;
    } else {
      throw new HttpException(
        'Name or number is not provided',
        HttpStatus.BAD_REQUEST,
      );
    }

    await this.entityManager.save(Contact);

    Phonebook.updatedAt = new Date();

    await this.entityManager.save(Phonebook);

    return Contact;
  }

  // 주소록 목록 조회
  async findphonebookList(userId: number) {
    const PhonebookList = await this.entityManager.find('PhonebookList', {
      where: {
        userId: userId,
      },
    });

    return PhonebookList;
  }

  // 주소록 멤버 삭제
  async deletePhonebookMember(userId: number, phonebookId: number, contactId) {
    const Phonebook =
      await this.phonebookListRepository.findOneByPhonebookIdAndUserId(
        phonebookId,
        userId,
      );

    if (!Phonebook) {
      throw new HttpException('Phonebook not found', HttpStatus.NOT_FOUND);
    }

    const Contact = await this.allCantactsRepository.findOneByContactId(
      contactId,
    );

    if (!Contact) {
      throw new HttpException('Contact not found', HttpStatus.NOT_FOUND);
    }
    console.log(Phonebook.members);
    console.log('!id', contactId);

    const index = Phonebook.members.indexOf(contactId);
    console.log('=========> ~ index:', index);

    if (index > -1) {
      Phonebook.members.splice(index, 1);
      Phonebook.updatedAt = new Date();
    }

    const renewPhonebook = await this.entityManager.save(Phonebook);

    return renewPhonebook;
  }
}
