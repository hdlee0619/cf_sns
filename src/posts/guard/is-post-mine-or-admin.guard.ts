import {
  BadRequestException,
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { RolesEnum } from '../../users/const/roles.const';
import { PostsService } from '../posts.service';
import { UsersModel } from '../../users/entities/users.entity';
import { Request } from 'express';

@Injectable()
export class IsPostMineOrAdminGuard implements CanActivate {
  constructor(private readonly postService: PostsService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest() as Request & {
      user: UsersModel;
    };

    const { user } = req;

    if (!user) {
      throw new UnauthorizedException('사용자 정보가 없습니다.');
    }

    /*
     * Admin일 경우 패스
     * */
    if (user.role === RolesEnum.ADMIN) {
      return true;
    }

    const postId = parseInt(req.params.postId);

    if (!postId) {
      throw new BadRequestException('postId가 필요합니다.');
    }

    const isOk = await this.postService.isPostMine(user.id, postId);

    if (!isOk) {
      throw new UnauthorizedException(
        '포스트 작성자또는 관리자만 수정/삭제가 가능합니다.',
      );
    }

    return true;
  }
}
