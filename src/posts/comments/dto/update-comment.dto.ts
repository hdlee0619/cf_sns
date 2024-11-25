import { PartialType } from '@nestjs/mapped-types';
import { CommentsModel } from '../entities/comments.entity';

export class UpdateCommentDto extends PartialType(CommentsModel) {}
