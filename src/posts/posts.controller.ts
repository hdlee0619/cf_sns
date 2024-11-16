import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Delete,
} from '@nestjs/common';
import { PostsService } from './posts.service';
import { UsersModel } from '../users/entities/users.entity';

@Controller('posts')
export class PostsController {
  constructor(private readonly postsService: PostsService) {}

  // 1) GET /posts
  // 모든 PostModel을 반환
  @Get()
  getPost() {
    return this.postsService.getAllPosts();
  }

  // 2) GET /posts/:id
  // id에 해당하는 PostModel을 반환
  @Get(':id')
  getPostById(@Param('id') id: string) {
    return this.postsService.getPostById(+id);
  }

  // 3) POST /posts
  // 새로운 PostModel을 생성
  @Post()
  createPost(
    @Body('author') author: UsersModel,
    @Body('title') title: string,
    @Body('content') content: string,
  ) {
    return this.postsService.createPost(author, title, content);
  }

  // 4) PATCH /posts/:id
  // id에 해당하는 PostModel을 수정
  @Patch(':id')
  patchPost(
    @Param('id') postId: string,
    @Body('author') author?: UsersModel,
    @Body('title') title?: string,
    @Body('content') content?: string,
  ) {
    return this.postsService.updatePost(+postId, author, title, content);
  }

  // 5) DELETE /posts/:id
  // id에 해당하는 PostModel을 삭제
  @Delete(':id')
  deletePost(@Param('id') id: string) {
    return this.postsService.deletePost(+id);
  }
}
