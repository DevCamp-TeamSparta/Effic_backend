import { Module } from '@nestjs/common';
import { ShorturlController } from './controller/shorturl.controller';
import { ShorturlService } from './service/shorturl.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UrlInfosRepository } from './shorturl.repository';
import { UrlInfo, TlyUrlInfo } from './shorturl.entity';

@Module({
  imports: [TypeOrmModule.forFeature([TlyUrlInfo, UrlInfo])],
  controllers: [ShorturlController],
  providers: [ShorturlService, UrlInfosRepository],
  exports: [ShorturlService, UrlInfosRepository],
})
export class ShorturlModule {}
