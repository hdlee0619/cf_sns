import { Column, Entity, OneToMany } from 'typeorm';
import { PostsModel } from '../../posts/entities/posts.entity';
import { RolesEnum } from '../const/roles.const';
import { BaseModel } from '../../common/entity/base.entity';

@Entity()
export class UsersModel extends BaseModel {
  @Column({
    length: 20,
    unique: true,
  })
  nickname: string;

  @Column({ unique: true })
  email: string;

  @Column()
  password: string;

  @Column({
    enum: RolesEnum,
    default: RolesEnum.USER,
  })
  role: RolesEnum;

  @OneToMany(() => PostsModel, (posts) => posts.author)
  posts: PostsModel[];
}
