import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger } from '@nestjs/common';
import { AppModule } from './app.module';
import { json, urlencoded } from 'express';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useLogger(new Logger('global', { timestamp: true }));

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // 페이로드와 DTO 클래스를 비교해 수신해서는 안되는 속성을 자동으로 제거하는 옵션(유효성이 검사된 객체만 수신)
      forbidNonWhitelisted: true, // 허용하지 않은 속성을 제거하는 대신 예외를 throw하는 옵션
      transform: true, // 네트워크를 통해 받는 페이로드가 DTO 클래스에 따라 지정된 개체로 자동 변환되도록 하는 옵션
    }),
  );
  app.enableCors();
  app.use(json({ limit: '50mb' }));
  app.use(urlencoded({ extended: true, limit: '50mb' }));

  await app.listen(3000);
}
bootstrap();


