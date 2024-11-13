import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PostsModel } from './entities/posts.entitiy';

@Injectable()
export class PostsService {
  constructor(
    @InjectRepository(PostsModel)
    private readonly postsRepository: Repository<PostsModel>,
  ) {}

  async getAllPosts() {
    return await this.postsRepository.find();
  }

  async getPostById(id: number) {
    const post = await this.postsRepository.findOne({
      where: { id },
    });

    if (!post) {
      throw new NotFoundException();
    }

    return post;
  }

  async createPost(author: string, title: string, content: string) {
    // 1) create -> 저장할 객체를 생성
    // 2) save -> 객체를 저장 (create 메서드에서 생성한 객체를 저장)
    // 보편적인 방법, 객체를 정상적으로 생성하면 save 메서드를 호출하여 저장
    const post = this.postsRepository.create({
      author,
      title,
      content,
      likeCount: 0,
      commentCount: 0,
    });

    // id가 자동으로 생성되어 저장
    return await this.postsRepository.save(post);
  }

  async updatePost(
    postId: number,
    author?: string,
    title?: string,
    content?: string,
  ) {
    // save
    // 1) 만약 데이터가 존재하지 않는다면 (id 기준으로) 새로 생성
    // 2) 만약 데이터가 존재한다면 (id 기준으로) 수정
    const post = await this.postsRepository.findOne({ where: { id: postId } });

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

    return await this.postsRepository.save(post);
  }

  async deletePost(postId: number) {
    const post = await this.postsRepository.findOne({ where: { id: postId } });

    if (!post) {
      throw new NotFoundException();
    }

    await this.postsRepository.delete(postId);

    return postId;
  }
}
