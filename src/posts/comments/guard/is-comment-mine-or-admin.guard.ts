import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Request } from 'express';
import { UsersModel } from '../../../users/entities/users.entity';
import { RolesEnum } from '../../../users/const/roles.const';
import { CommentsService } from '../comments.service';

@Injectable()
export class IsCommentMineOrAdminGuard implements CanActivate {
  constructor(private readonly commentService: CommentsService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context
      .switchToHttp()
      .getRequest<Request & { user: UsersModel }>();

    const { user } = req;

    if (!user) {
      throw new UnauthorizedException('사용자 정보가 없습니다.');
    }

    if (user.role === RolesEnum.ADMIN) {
      return true;
    }

    const commentId = parseInt(req.params.commentId);

    const isOk = await this.commentService.isCommentMine(user.id, commentId);

    if (!isOk) {
      throw new UnauthorizedException(
        '댓글 작성자 또는 관리자만 수정/삭제가 가능합니다.',
      );
    }

    return true;
  }
}
