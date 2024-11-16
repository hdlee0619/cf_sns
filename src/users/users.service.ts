import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UsersModel } from './entities/users.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(UsersModel)
    private readonly usersRepository: Repository<UsersModel>,
  ) {}

  async createUser(user: Pick<UsersModel, 'email' | 'password' | 'nickname'>) {
    // 1) nickname 중복 여부 확인
    const isNicknameExist = await this.usersRepository.exists({
      where: {
        nickname: user.nickname,
      },
    });

    if (isNicknameExist) {
      throw new BadRequestException('이미 존재하는 닉네임입니다.');
    }

    const isEmailExist = await this.usersRepository.exists({
      where: {
        nickname: user.email,
      },
    });

    if (isEmailExist) {
      throw new BadRequestException('이미 존재하는 이메일입니다.');
    }

    const userObject = this.usersRepository.create({
      ...user,
    });

    return await this.usersRepository.save(userObject);
  }

  async getAllUsers() {
    return await this.usersRepository.find();
  }

  async getUserByEmail(email: string) {
    return await this.usersRepository.findOne({
      where: { email },
    });
  }
}
