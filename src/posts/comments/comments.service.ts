import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CommentsModel } from './entities/comments.entity';
import { QueryRunner, Repository } from 'typeorm';
import { CreateCommentDto } from './dto/create-comment.dto';
import { PaginateCommentDto } from './dto/paginate-comment.dto';
import { CommonService } from '../../common/common.service';
import { UpdateCommentDto } from './dto/update-comment.dto';
import { DEFAULT_COMMENT_FIND_OPTIONS } from './const/default-comment-find-options.const';

@Injectable()
export class CommentsService {
  constructor(
    @InjectRepository(CommentsModel)
    private readonly commentsRepository: Repository<CommentsModel>,
    private readonly commonService: CommonService,
  ) {}

  getRepository(qr?: QueryRunner) {
    return qr
      ? qr.manager.getRepository(CommentsModel)
      : this.commentsRepository;
  }

  async paginateComments(dto: PaginateCommentDto, postId: number) {
    return await this.commonService.paginate(
      dto,
      this.commentsRepository,
      {
        ...DEFAULT_COMMENT_FIND_OPTIONS,
      },
      `posts/${postId}/comments`,
    );
  }

  async getCommentById(id: number) {
    const comment = await this.commentsRepository.findOne({
      ...DEFAULT_COMMENT_FIND_OPTIONS,
      where: {
        id,
      },
    });

    if (!comment) {
      throw new NotFoundException();
    }

    return comment;
  }

  async createComment(
    authorId: number,
    postId: number,
    dto: CreateCommentDto,
    qr?: QueryRunner,
  ) {
    const repository = this.getRepository(qr);

    return repository.save({
      author: {
        id: authorId,
      },
      post: {
        id: postId,
      },
      ...dto,
    });
  }

  async updateComment(commentId: number, dto: UpdateCommentDto) {
    const comment = await this.commentsRepository.findOne({
      where: {
        id: commentId,
      },
    });

    if (!comment) {
      throw new NotFoundException();
    }

    const prevComment = await this.commentsRepository.preload({
      id: commentId,
      ...dto,
    });

    return await this.commentsRepository.save(prevComment);
  }

  async deleteComment(commentId: number, qr?: QueryRunner) {
    const repository = this.getRepository(qr);

    const comment = await repository.findOne({
      where: {
        id: commentId,
      },
    });

    if (!comment) {
      throw new NotFoundException();
    }

    await repository.delete(commentId);

    return commentId;
  }

  async isCommentMine(userId: number, commentId: number) {
    return this.commentsRepository.exists({
      where: {
        id: commentId,
        author: {
          id: userId,
        },
      },
      select: {
        author: {
          id: true,
        },
      },
    });
  }
}
