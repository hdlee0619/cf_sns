import { Controller, Get, Param, Query } from '@nestjs/common';
import { ChatsMessagesService } from './messages.service';
import { BasePaginationDto } from '../../common/dto/base-pagination.dto';

@Controller('chats/:cid/messages')
export class MessagesController {
  constructor(private readonly messagesService: ChatsMessagesService) {}

  @Get()
  paginateMessages(@Param('cid') cid: number, @Query() dto: BasePaginationDto) {
    return this.messagesService.paginateMessages(dto, {
      where: {
        chat: {
          id: cid,
        },
      },
      relations: {
        author: true,
        chat: true,
      },
    });
  }
}
