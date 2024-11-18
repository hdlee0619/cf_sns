import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthService } from '../auth.service';

/*
 * 구현할 기능
 *
 * 1. 요청 객체 (request)를 불러오고 authorization header로부터 토큰 가져온다.
 * 2. authService.extractTokenFromHeader를 이용해서 사용할 수 있는 형태의 토큰 추출
 * 3. authService.decodeBasicToken을 이용해서 email, password 추출
 * 4. email, password를 이용해서 사용자 검증 진행
 * 5. 찾아낸 사용자를 (1) 요청 객체를 붙여준다.
 * */
@Injectable()
export class BasicTokenGuard implements CanActivate {
  constructor(private readonly authService: AuthService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest();

    const rawToken = req.headers['authorization'];

    if (!rawToken) {
      throw new UnauthorizedException('not found token');
    }

    const token = this.authService.extractTokenFromHeader(rawToken, false);

    const { email, password } = this.authService.decodeBasicToken(token);

    req.user = await this.authService.authenticateWithEmailAndPassword({
      email,
      password,
    });

    return true;
  }
}
