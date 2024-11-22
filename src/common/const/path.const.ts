import { join } from 'path';

export const PROJECT_ROOT_PATH = process.cwd();
// 외부에서 접근 가능한 파일들을 모아둔 폴더 이름
export const PUBLIC_DIR_NAME = 'public';
// 포스트 이미지 저장 폴더 이름
export const POSTS_DIR_NAME = 'posts';
// 임시폴더 이름
export const TEMP_DIR_NAME = 'temp';
// 실제 공개 폴더의 절대 경로
export const PUBLIC_DIR_PATH = join(PROJECT_ROOT_PATH, PUBLIC_DIR_NAME);

export const POSTS_IMAGE_DIR_PATH = join(PUBLIC_DIR_PATH, POSTS_DIR_NAME);

export const POST_PUBLIC_IMAGE_PATH = join(PUBLIC_DIR_NAME, POSTS_DIR_NAME);

// 임시파일 저장 경로
export const TEMP_DIR_PATH = join(PUBLIC_DIR_PATH, TEMP_DIR_NAME);
