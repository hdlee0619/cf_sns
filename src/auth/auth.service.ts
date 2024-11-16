import * as bcrypt from 'bcrypt';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersModel } from '../users/entities/users.entity';
import { HASH_ROUND, JWT_SECRET } from './const/auth.const';
import { UsersService } from '../users/users.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly usersService: UsersService,
  ) {}
  /*
   * 토큰 사용 방식
   *
   * 1) 사용자가 로그인 또는 회원가입을 진행하면 accessToken, refreshToken을 반환
   * 2) 로그인 할때는 Basic Token과 함께 요청을 보낸다.
   *  - Basic 토큰은 '이메일:비밀번호'를 Basd64로 인코딩한 값
   * 3) 아무나 접근 할 수 없는 정보(private route)를 접근 할때는 Header에 accessToken을 함께 보낸다.
   * 4) 토큰과 요청을 함께 받은 서버는 토큰 검증을 통해 현재 요청을 보낸 사용자를 알 수 있다.
   * 5) 모든 토큰은 만료 기간이 있고, 만료기간이 지나면 새로 토큰을 발급 받아야한다.
   *  - 그렇지 않으면 jwtService.verify()에서 에러가 발생한다.
   * 6) 토큰이 만료되면 각각의 토큰을 새로 발급 받을 수 있는 엔드포인트에 요청해서
   *  새로운 토큰을 발급받고 새로운 토큰을 사용해서 private route에 접근한다.
   * */

  /*
   * Header로 부터 토큰을 받을 때
   * {authorization: 'Basic {token}'}
   * {authorization: 'Bearer {token}'}
   * */
  extractTokenFromHeader(header: string, isBearer: boolean) {
    const splitToken = header.split(' ');

    const prefix = isBearer ? 'Bearer' : 'Basic';

    if (splitToken.length !== 2 || splitToken[0] !== prefix) {
      throw new UnauthorizedException('invalid token');
    }

    return splitToken[1];
  }

  decodeBasicToken(base64String: string) {
    const decoded = Buffer.from(base64String, 'base64').toString('utf8');

    const split = decoded.split(':');

    if (split.length !== 2) {
      throw new UnauthorizedException('invalid token');
    }

    return { email: split[0], password: split[1] };
  }

  verifyToken(token: string) {
    return this.jwtService.verify(token, {
      secret: JWT_SECRET,
    });
  }

  rotateToken(token: string, isRefreshToken: boolean) {
    const decoded = this.jwtService.verify(token, {
      secret: JWT_SECRET,
    });

    if (decoded.type !== 'refresh') {
      throw new UnauthorizedException('invalid refresh token');
    }

    return this.signToken({ ...decoded }, isRefreshToken);
  }

  /*
   * 추가하려는 기능
   *
   * 1) registerWithEmail
   *  - email, nickname, password를 받아서 새로운 사용자를 생성
   *  - 회원가입 후 다시 로그인해주세요 방지를 위해 accessToken, refreshToken을 반환
   *
   * 2) loginWithEmail
   *  - email, password를 받아서 사용자 검증 진행
   *  - 검증 후 accessToken, refreshToken을 반환
   *
   * 3) loginUser
   *  - (1)과 (2)에서 필요한 accessToken, refreshToken을 반환
   *
   * 4) signToken
   *  - (3)에서 필요한 accessToken, refreshToken을 생성
   *
   * 5) authenticateWithEmailAndPassword
   *  - (2)에서 필요한 사용자 검증 진행
   *  - 사용자가 존재하는지 확인
   *  - 비밀번호가 맞는지 확인
   *  - 모두 통과시 사용자 정보 반환
   *  - loginWithEmail에서 반환된 데이터를 기반으로 토큰 생성
   * */

  /*
   * payload
   * 1) email
   * 2) sub -> user id
   * 3) type -> access, refresh
   * */
  signToken(user: Pick<UsersModel, 'email' | 'id'>, isRefreshToken: boolean) {
    const payload = {
      email: user.email,
      sub: user.id,
      type: isRefreshToken ? 'refresh' : 'access',
    };

    return this.jwtService.sign(payload, {
      secret: JWT_SECRET,
      // seconds
      expiresIn: isRefreshToken ? 3600 : 300,
    });
  }

  loginUser(user: Pick<UsersModel, 'email' | 'id'>) {
    return {
      accessToken: this.signToken(user, false),
      refreshToken: this.signToken(user, true),
    };
  }

  async authenticateWithEmailAndPassword(
    user: Pick<UsersModel, 'email' | 'password'>,
  ) {
    const existingUser = await this.usersService.getUserByEmail(user.email);

    if (!existingUser) {
      throw new UnauthorizedException('email not found');
    }

    /*
     * 파라미터
     *
     * 1) 입력된 비밀번호
     * 2) 기존 해시 (hash) -> 사용자 정보에 저장되어있는 hash
     * */
    const passsOk = await bcrypt.compare(user.password, existingUser.password);

    if (!passsOk) {
      throw new UnauthorizedException('password is wrong');
    }

    return existingUser;
  }

  async loginWithEmail(user: Pick<UsersModel, 'email' | 'password'>) {
    const existingUser = await this.authenticateWithEmailAndPassword(user);

    return this.loginUser(existingUser);
  }

  async registerWithEmail(
    user: Pick<UsersModel, 'email' | 'password' | 'nickname'>,
  ) {
    const hash = await bcrypt.hash(user.password, HASH_ROUND);

    const newUser = await this.usersService.createUser({
      ...user,
      password: hash,
    });

    return this.loginUser(newUser);
  }
}
