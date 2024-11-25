import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { QueryRunner, Repository } from 'typeorm';
import { PostsModel } from './entities/posts.entity';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { PaginatePostDto } from './dto/paginate-post.dto';
import { CommonService } from '../common/common.service';
import { ImageModel } from '../common/entity/image.entity';
import { DEFAULT_POST_FIND_OPTIONS } from './const/default-post-find-options.const';

@Injectable()
export class PostsService {
  constructor(
    @InjectRepository(PostsModel)
    private readonly postsRepository: Repository<PostsModel>,
    @InjectRepository(ImageModel)
    private readonly imageRepository: Repository<ImageModel>,
    private readonly commonService: CommonService,
  ) {}

  async getAllPosts() {
    return await this.postsRepository.find({
      ...DEFAULT_POST_FIND_OPTIONS,
    });
  }

  async paginatePosts(dto: PaginatePostDto) {
    return this.commonService.paginate(
      dto,
      this.postsRepository,
      {
        ...DEFAULT_POST_FIND_OPTIONS,
      },
      'posts',
    );
  }

  async generatePosts(userId: number) {
    for (let i = 0; i < 100; i++) {
      await this.createPost(userId, {
        title: `임의로 생성된 포스트 제목 ${i}`,
        content: `임의로 생성된 포스트 내용 ${i}`,
      });
    }
  }

  async getPostById(id: number, qr?: QueryRunner) {
    const repository = this.getRepository(qr);

    const post = await repository.findOne({
      ...DEFAULT_POST_FIND_OPTIONS,
      where: { id },
    });

    if (!post) {
      throw new NotFoundException();
    }

    return post;
  }

  getRepository(qr?: QueryRunner) {
    return qr
      ? qr.manager.getRepository<PostsModel>(PostsModel)
      : this.postsRepository;
  }

  async createPost(authorId: number, postDto: CreatePostDto, qr?: QueryRunner) {
    // 1) create -> 저장할 객체를 생성
    // 2) save -> 객체를 저장 (create 메서드에서 생성한 객체를 저장)
    // 보편적인 방법, 객체를 정상적으로 생성하면 save 메서드를 호출하여 저장
    const repository = this.getRepository(qr);

    const post = repository.create({
      author: {
        id: authorId,
      },
      ...postDto,
      images: [],
      likeCount: 0,
      commentCount: 0,
    });

    // id가 자동으로 생성되어 저장
    return await repository.save(post);
  }

  async updatePost(postId: number, body: UpdatePostDto) {
    const { title, content } = body;

    // save
    // 1) 만약 데이터가 존재하지 않는다면 (id 기준으로) 새로 생성
    // 2) 만약 데이터가 존재한다면 (id 기준으로) 수정
    const post = await this.postsRepository.findOne({
      where: { id: postId },
    });

    if (!post) {
      throw new NotFoundException('포스트가 존재하지 않습니다.');
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
    const post = await this.postsRepository.findOne({
      ...DEFAULT_POST_FIND_OPTIONS,
      where: { id: postId },
    });

    if (!post) {
      throw new NotFoundException();
    }

    await this.postsRepository.delete(postId);

    return postId;
  }

  async checkPostExistsById(id: number) {
    return await this.postsRepository.exists({
      where: {
        id,
      },
    });
  }

  async isPostMine(userId: number, postId: number) {
    return await this.postsRepository.exists({
      where: {
        id: postId,
        author: {
          id: userId,
        },
      },
      relations: {
        author: true,
      },
    });
  }

  async incrementCommentCount(postId: number, qr?: QueryRunner) {
    const repository = this.getRepository(qr);

    return await repository.increment({ id: postId }, 'commentCount', 1);
  }

  async decrementCommentCount(postId: number, qr?: QueryRunner) {
    const repository = this.getRepository(qr);

    return await repository.decrement({ id: postId }, 'commentCount', 1);
  }
}
