import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Observable, tap } from 'rxjs';

@Injectable()
export class LogInterceptor implements NestInterceptor {
  intercept(
    context: ExecutionContext,
    next: CallHandler<any>,
  ): Observable<any> {
    /*
     * 요청이 들어올 떄 Req 요청이 들어온 타임스탬프 찍기
     * [REQ] {요청 path} {요청 시간}
     *
     * [RES] {요청 path} {응답 시간} {걸린 시간 ms}
     * */

    const req = context.switchToHttp().getRequest();

    const path = req.originalUrl;

    const now = new Date();

    console.log(`[REQ] ${path} ${now.toLocaleString('kr')}`);

    return next.handle().pipe(
      tap(() => {
        console.log(
          `[RES] ${path} ${new Date().toLocaleString('kr')} ${
            new Date().getMilliseconds() - now.getMilliseconds()
          }ms`,
        );
      }),
    );
  }
}
