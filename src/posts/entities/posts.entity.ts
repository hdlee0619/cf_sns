import { Entity, Column, ManyToOne } from 'typeorm';
import { UsersModel } from '../../users/entities/users.entity';
import { BaseModel } from '../../common/entity/base.entity';
import { IsString } from 'class-validator';

@Entity()
export class PostsModel extends BaseModel {
  @ManyToOne(() => UsersModel, (user) => user.posts, {
    nullable: false,
  })
  author: UsersModel;

  @Column()
  @IsString({
    message: 'title는 string type 이어야 합니다.',
  })
  title: string;

  @Column()
  @IsString({ message: 'content은 string type 이어야 합니다.' })
  content: string;

  @Column()
  likeCount: number;

  @Column()
  commentCount: number;
}
