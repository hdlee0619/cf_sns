import {
  BadRequestException,
  Controller,
  DefaultValuePipe,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseInterceptors,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { Roles } from './decorator/roles.decorator';
import { RolesEnum } from './const/roles.const';
import { User } from './decorator/user.decorator';
import { UsersModel } from './entities/users.entity';
import { TransactionInterceptor } from '../common/interceptor/transaction.interceptor';
import { QueryRunner } from '../common/decorator/query-runner.decorator';
import { QueryRunner as QR } from 'typeorm';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  @Roles(RolesEnum.ADMIN)
  /*
   * serialization -> 직렬화
   * -> 현재 시스템에서 사용되는 데이터의 구조를 다른 시스템에서도 쉽게 사용할 수 있는 포멧으로 변환
   * -> class의 object에서 json으로 변환
   * */
  getUsers() {
    return this.usersService.getAllUsers();
  }

  @Get('follow/me')
  async getFollow(
    @User() user: UsersModel,
    @Query('includeNotConfirmed', new DefaultValuePipe(false))
    includeNotConfirmed: boolean,
  ) {
    return await this.usersService.getFollow(user.id, includeNotConfirmed);
  }

  @Post('follow/:id')
  async postFollow(@User() user: UsersModel, @Param('id') followingId: number) {
    if (user.id === followingId) {
      throw new BadRequestException('자기자신을 팔로우할 수 없습니다.');
    }

    await this.usersService.followUser(user.id, followingId);

    return true;
  }

  @Patch('follow/:id/confirm')
  @UseInterceptors(TransactionInterceptor)
  async patchFollowConfirm(
    @User() user: UsersModel,
    @Param('id') followerId: number,
    @QueryRunner() qr: QR,
  ) {
    await this.usersService.confirmFollow(followerId, user.id, qr);

    await this.usersService.incrementFollowerCount(user.id, qr);

    return true;
  }

  @Delete('follow/:id')
  @UseInterceptors(TransactionInterceptor)
  async deleteFollow(
    @User() user: UsersModel,
    @Param('id') followingId: number,
    @QueryRunner() qr: QR,
  ) {
    await this.usersService.deleteFollow(user.id, followingId, qr);

    await this.usersService.decrementFollowerCount(user.id, qr);

    return true;
  }
}
