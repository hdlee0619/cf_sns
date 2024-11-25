import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { QueryRunner, Repository } from 'typeorm';
import { UsersModel } from './entities/users.entity';
import { UserFollowersModel } from './entities/user-followers.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(UsersModel)
    private readonly usersRepository: Repository<UsersModel>,
    @InjectRepository(UserFollowersModel)
    private readonly userFollowersRepository: Repository<UserFollowersModel>,
  ) {}

  getUsersRepository(qr?: QueryRunner) {
    return qr
      ? qr.manager.getRepository<UsersModel>(UsersModel)
      : this.usersRepository;
  }

  getUserFollowersRepository(qr?: QueryRunner) {
    return qr
      ? qr.manager.getRepository<UserFollowersModel>(UserFollowersModel)
      : this.userFollowersRepository;
  }

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

  async getFollow(userId: number, includeNotConfirmed: boolean) {
    const where = {
      following: {
        id: userId,
      },
    };

    if (!includeNotConfirmed) {
      where['isConfirmed'] = true;
    }

    const result = await this.userFollowersRepository.find({
      where: {
        ...where,
      },
      relations: {
        follower: true,
        following: true,
      },
    });

    return result.map((item) => ({
      id: item.follower.id,
      nickname: item.follower.nickname,
      isConfirmed: item.isConfirmed,
    }));
  }

  async followUser(followerId: number, followingId: number, qr?: QueryRunner) {
    const userFollowersRepository = this.getUserFollowersRepository(qr);

    await userFollowersRepository.save({
      follower: {
        id: followerId,
      },
      following: {
        id: followingId,
      },
    });

    return true;
  }

  async confirmFollow(
    followerId: number,
    followingId: number,
    qr?: QueryRunner,
  ) {
    const userFollowersRepository = this.getUserFollowersRepository(qr);

    const existing = await userFollowersRepository.findOne({
      where: {
        follower: {
          id: followerId,
        },
        following: {
          id: followingId,
        },
      },
      relations: {
        follower: true,
        following: true,
      },
    });

    if (!existing) {
      throw new BadRequestException('팔로우 요청이 존재하지 않습니다.');
    }

    await userFollowersRepository.save({
      ...existing,
      isConfirmed: true,
    });

    return true;
  }

  async deleteFollow(
    followerId: number,
    followingId: number,
    qr?: QueryRunner,
  ) {
    const userFollowersRepository = this.getUserFollowersRepository(qr);

    await userFollowersRepository.delete({
      follower: {
        id: followerId,
      },
      following: {
        id: followingId,
      },
    });

    return true;
  }

  async incrementFollowerCount(userId: number, qr?: QueryRunner) {
    const userRepository = this.getUsersRepository(qr);

    await userRepository.increment(
      {
        id: userId,
      },
      'followerCount',
      1,
    );
  }

  async decrementFollowerCount(userId: number, qr?: QueryRunner) {
    const userRepository = this.getUsersRepository(qr);

    await userRepository.decrement(
      {
        id: userId,
      },
      'followerCount',
      1,
    );
  }
}
