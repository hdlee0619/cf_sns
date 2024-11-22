import { BadRequestException, Module } from '@nestjs/common';
import { CommonService } from './common.service';
import { CommonController } from './common.controller';
import { MulterModule } from '@nestjs/platform-express';
import { extname } from 'path';
import * as multer from 'multer';
import { TEMP_DIR_PATH } from './const/path.const';
import { v4 as uuid } from 'uuid';
import { AuthModule } from '../auth/auth.module';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [
    UsersModule,
    AuthModule,
    MulterModule.register({
      limits: {
        // byte 단위
        fileSize: 10000000,
      },
      fileFilter: (req, file, callback) => {
        /*
         * callback(error, boolean)
         *
         * 첫번째 파라미터에는 에러가 있을 경우에는 에러 정보를 넣어줌
         * 두번째 파라미터에는 파일을 받을지 말지 boolean 값으로 넣어줌
         * */

        const ext = extname(file.originalname);

        if (ext !== '.jpg' && ext !== '.jpeg' && ext !== '.png') {
          return callback(
            new BadRequestException('jpg/jpeg/png 파일만 업로드 가능합니다.'),
            false,
          );
        }

        return callback(null, true);
      },
      storage: multer.diskStorage({
        destination: function (req, res, callback) {
          callback(null, TEMP_DIR_PATH);
        },
        filename(req, file, callback) {
          callback(null, `${uuid()}${extname(file.originalname)}`);
        },
      }),
    }),
  ],
  controllers: [CommonController],
  providers: [CommonService],
  exports: [CommonService],
})
export class CommonModule {}
