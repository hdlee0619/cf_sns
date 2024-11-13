import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Delete,
  NotFoundException,
} from '@nestjs/common';
import { PostsService } from './posts.service';

interface PostModel {
  id: number;
  author: string;
  title: string;
  content: string;
  likeCount: number;
  commentCount: number;
}

let posts: PostModel[] = [
  {
    id: 1,
    author: 'newjeans_official',
    title: '뉴진스 민지',
    content: '메이크업 고치고 있는 민지',
    likeCount: 100000,
    commentCount: 999,
  },
  {
    id: 2,
    author: 'redvelvet_official',
    title: '레드벨벳 슬기',
    content: '춤 연습하고 있는 슬기',
    likeCount: 100000,
    commentCount: 999,
  },
  {
    id: 3,
    author: 'redvelvet_official',
    title: '레드벨벳 아이린',
    content: '노래 연습하고 있는 아이린',
    likeCount: 100000,
    commentCount: 999,
  },
];

@Controller('posts')
export class PostsController {
  constructor(private readonly postsService: PostsService) {}

  // 1) GET /posts
  // 모든 PostModel을 반환
  @Get()
  getPost(): PostModel[] {
    return posts;
  }

  // 2) GET /posts/:id
  // id에 해당하는 PostModel을 반환
  @Get(':id')
  getPostById(@Param('id') id: string): PostModel {
    const post = posts.find((post) => post.id === +id);

    if (!post) {
      throw new NotFoundException();
    }
    return post;
  }

  // 3) POST /posts
  // 새로운 PostModel을 생성
  @Post()
  createPost(
    @Body('author') author: string,
    @Body('title') title: string,
    @Body('content') content: string,
  ) {
    const post: PostModel = {
      id: posts[posts.length - 1].id + 1,
      author,
      title,
      content,
      likeCount: 0,
      commentCount: 0,
    };
    posts = [...posts, post];

    return post;
  }

  // 4) PATCH /posts/:id
  // id에 해당하는 PostModel을 수정
  @Patch(':id')
  patchPost(
    @Param('id') id: string,
    @Body('author') author?: string,
    @Body('title') title?: string,
    @Body('content') content?: string,
  ) {
    const post = posts.find((post) => post.id === +id);

    if (!post) {
      throw new NotFoundException();
    }

    if (author) {
      post.author = author;
    }

    if (title) {
      post.title = title;
    }

    if (content) {
      post.content = content;
    }

    posts = posts.map((prePost) => (prePost.id === +id ? post : prePost));

    return post;
  }

  // 5) DELETE /posts/:id
  // id에 해당하는 PostModel을 삭제
  @Delete(':id')
  deletePost(@Param('id') id: string) {
    const post = posts.find((post) => post.id === +id);

    if (!post) {
      throw new NotFoundException();
    }

    posts = posts.filter((post) => post.id !== +id);

    return id;
  }
}
