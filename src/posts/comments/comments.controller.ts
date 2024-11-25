import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { CommentsService } from './comments.service';

import { User } from '../../users/decorator/user.decorator';
import { CreateCommentDto } from './dto/create-comment.dto';
import { PaginateCommentDto } from './dto/paginate-comment.dto';
import { UpdateCommentDto } from './dto/update-comment.dto';
import { UsersModel } from '../../users/entities/users.entity';
import { IsPublic } from '../../common/decorator/is-public.decorator';
import { IsCommentMineOrAdminGuard } from './guard/is-comment-mine-or-admin.guard';
import { TransactionInterceptor } from '../../common/interceptor/transaction.interceptor';
import { QueryRunner } from '../../common/decorator/query-runner.decorator';
import { QueryRunner as QR } from 'typeorm';
import { PostsService } from '../posts.service';

@Controller('posts/:postId/comments')
export class CommentsController {
  constructor(
    private readonly commentsService: CommentsService,
    private readonly postsService: PostsService,
  ) {}

  /*
   * 1) Entity 생성
   * author -> 작성자
   * post -> 귀속되는 포스트
   * comment -> 실제 댓글 내용
   * likeCount -> 좋아요 수
   *
   * id -> Primary Key
   * createdAt -> 생성일
   * updatedAt -> 수정일
   *
   * 2) Get() pagination
   * 3) Get(':commentId') 특정 댓글 조회
   * 4) Post() 댓글 생성
   * 5) Patch(':commentId') 댓글 수정
   * 6) Delete(':commentId') 댓글 삭제
   * */
  @Get()
  @IsPublic()
  getComments(
    @Query() query: PaginateCommentDto,
    @Param('postId') postId: number,
  ) {
    return this.commentsService.paginateComments(query, postId);
  }

  @Get(':commentId')
  @IsPublic()
  getComment(@Param('commentId') commentId: number) {
    return this.commentsService.getCommentById(commentId);
  }

  @Post()
  @UseInterceptors(TransactionInterceptor)
  async createComment(
    @User() user: UsersModel,
    @Param('postId') postId: number,
    @Body() body: CreateCommentDto,
    @QueryRunner() qr?: QR,
  ) {
    const res = await this.commentsService.createComment(
      user.id,
      postId,
      body,
      qr,
    );

    await this.postsService.incrementCommentCount(postId, qr);

    return res;
  }

  @Patch(':commentId')
  @UseGuards(IsCommentMineOrAdminGuard)
  updateComment(
    @Param('commentId') commentId: number,
    @Body() dto: UpdateCommentDto,
  ) {
    return this.commentsService.updateComment(commentId, dto);
  }

  @Delete(':commentId')
  @UseInterceptors(TransactionInterceptor)
  @UseGuards(IsCommentMineOrAdminGuard)
  async deleteComment(
    @Param('postId') postId: number,
    @Param('commentId') commentId: number,
    @QueryRunner() qr?: QR,
  ) {
    await this.commentsService.deleteComment(commentId, qr);

    await this.postsService.decrementCommentCount(postId, qr);

    return commentId;
  }
}
