import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from '../user.entity';

@Injectable()
export class UsersService {
  constructor(@InjectRepository(User) private repo: Repository<User>) {}

  async create(email: string) {
    const user = await this.repo.findOne({ where: { email } });
    if (user) {
      //   이메일 인증으로 로그인 시켜야함
    } else {
      await this.repo.save({ email });
    }
  }
}
