import { Column, Entity, JoinTable, ManyToMany, OneToMany } from 'typeorm';
import { IsEmail, IsString, Length } from 'class-validator';
import { Exclude, Expose } from 'class-transformer';
import { PostsModel } from '../../posts/entities/posts.entity';
import { RolesEnum } from '../const/roles.const';
import { BaseModel } from '../../common/entity/base.entity';
import { lengthValidationMessage } from '../../common/validation-message/length-validation-message';
import { stringValidationMessage } from '../../common/validation-message/string-validation-message';
import { emailValidationMessage } from '../../common/validation-message/email-validation-message';
import { ChatsModel } from '../../chats/entity/chats.entity';
import { MessagesModel } from '../../chats/messages/entity/messages.entity';

@Entity()
export class UsersModel extends BaseModel {
  @Column({
    length: 20,
    unique: true,
  })
  @IsString({
    message: stringValidationMessage,
  })
  @Length(2, 20, {
    message: lengthValidationMessage,
  })
  @Expose()
  nickname: string;

  @Column({ unique: true })
  @IsString({
    message: stringValidationMessage,
  })
  @IsEmail(
    {},
    {
      message: emailValidationMessage,
    },
  )
  email: string;

  @Column()
  @IsString({
    message: stringValidationMessage,
  })
  @Length(3, 8, {
    message: lengthValidationMessage,
  })
  /*
   * Request
   * class instance(dto) -> plain object(JSON)
   *
   * Response
   * plain object(JSON) -> class instance(dto)
   *
   * toClassOnly -> class instance로 변환 될 때
   * toPlainOnly -> plain object로 변환 될 때
   * */
  @Exclude({
    toPlainOnly: true,
  })
  password: string;

  @Column({
    enum: RolesEnum,
    default: RolesEnum.USER,
  })
  role: RolesEnum;

  @OneToMany(() => PostsModel, (posts) => posts.author)
  posts: PostsModel[];

  @ManyToMany(() => ChatsModel, (chat) => chat.users)
  @JoinTable()
  chats: ChatsModel[];

  @OneToMany(() => MessagesModel, (message) => message.author)
  messages: MessagesModel[];
}
