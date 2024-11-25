import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
  Query,
} from '@nestjs/common';
import { CommentsService } from './comments.service';
import { AccessTokenGuard } from '../../auth/guard/bearer-token.guard';
import { User } from '../../users/decorator/user.decorator';
import { CreateCommentDto } from './dto/create-comment.dto';
import { PaginateCommentDto } from './dto/paginate-comment.dto';
import { UpdateCommentDto } from './dto/update-comment.dto';
import { UsersModel } from '../../users/entities/users.entity';

@Controller('posts/:postId/comments')
export class CommentsController {
  constructor(private readonly commentsService: CommentsService) {}

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
  getComments(
    @Query() query: PaginateCommentDto,
    @Param('postId') postId: number,
  ) {
    return this.commentsService.paginateComments(query, postId);
  }

  @Get(':commentId')
  getComment(@Param('commentId') commentId: number) {
    return this.commentsService.getCommentById(commentId);
  }

  @Post()
  @UseGuards(AccessTokenGuard)
  createComment(
    @User() user: UsersModel,
    @Param('postId') postId: number,
    @Body() body: CreateCommentDto,
  ) {
    return this.commentsService.createComment(user.id, postId, body);
  }

  @Patch(':commentId')
  @UseGuards(AccessTokenGuard)
  updateComment(
    @Param('commentId') commentId: number,
    @Body() dto: UpdateCommentDto,
  ) {
    return this.commentsService.updateComment(commentId, dto);
  }

  @Delete(':commentId')
  @UseGuards(AccessTokenGuard)
  deleteComment(@Param('commentId') commentId: number) {
    return this.commentsService.deleteComment(commentId);
  }
}