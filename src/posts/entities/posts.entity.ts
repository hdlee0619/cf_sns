import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { UsersModel } from '../../users/entities/users.entity';

@Entity()
export class PostsModel {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => UsersModel, (user) => user.posts)
  author: UsersModel;

  @Column()
  title: string;

  @Column()
  content: string;

  @Column()
  likeCount: number;

  @Column()
  commentCount: number;
}
