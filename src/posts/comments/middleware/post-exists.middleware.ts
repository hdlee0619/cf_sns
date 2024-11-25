import {
  BadRequestException,
  Injectable,
  NestMiddleware,
} from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { PostsService } from '../../posts.service';

@Injectable()
export class PostExistsMiddleware implements NestMiddleware {
  constructor(private readonly postService: PostsService) {}

  async use(req: Request, res: Response, next: NextFunction) {
    const postId = parseInt(req.params.postId);

    if (!postId) {
      throw new BadRequestException('postId가 필요합니다.');
    }

    const exists = await this.postService.checkPostExistsById(postId);

    if (!exists) {
      throw new BadRequestException(
        '해당 postId의 포스트가 존재하지 않습니다.',
      );
    }

    next();
  }
}
