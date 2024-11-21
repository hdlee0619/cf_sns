import { Column, Entity, OneToMany } from 'typeorm';
import { PostsModel } from '../../posts/entities/posts.entity';
import { RolesEnum } from '../const/roles.const';
import { BaseModel } from '../../common/entity/base.entity';
import { IsEmail, IsString, Length } from 'class-validator';

@Entity()
export class UsersModel extends BaseModel {
  @Column({
    length: 20,
    unique: true,
  })
  @IsString()
  @Length(2, 20, {
    message: '닉네임은 2~20자로 입력해주세요.',
  })
  nickname: string;

  @Column({ unique: true })
  @IsString()
  @IsEmail()
  email: string;

  @Column()
  @IsString()
  @Length(3, 8)
  password: string;

  @Column({
    enum: RolesEnum,
    default: RolesEnum.USER,
  })
  role: RolesEnum;

  @OneToMany(() => PostsModel, (posts) => posts.author)
  posts: PostsModel[];
}
