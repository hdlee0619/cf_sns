import {
  MiddlewareConsumer,
  Module,
  NestModule,
  RequestMethod,
} from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PostsModel } from './entities/posts.entity';
import { PostsService } from './posts.service';
import { PostsController } from './posts.controller';
import { UsersModule } from '../users/users.module';
import { AuthModule } from '../auth/auth.module';
import { CommonModule } from '../common/common.module';
import { ImageModel } from '../common/entity/image.entity';
import { PostImagesService } from './image/images.service';
import { LogMiddleware } from '../common/middleware/log.middleware';

@Module({
  imports: [
    TypeOrmModule.forFeature([PostsModel, ImageModel]),
    UsersModule,
    AuthModule,
    CommonModule,
  ],
  exports: [PostsService],
  controllers: [PostsController],
  providers: [PostsService, PostImagesService],
})
export class PostsModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(LogMiddleware).forRoutes({
      path: 'posts',
      method: RequestMethod.ALL,
    });
  }
}
