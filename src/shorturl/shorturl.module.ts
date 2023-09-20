import { Module } from '@nestjs/common';
import { ShorturlController } from './controller/shorturl.controller';
import { ShorturlService } from './service/shorturl.service';

@Module({
  controllers: [ShorturlController],
  providers: [ShorturlService],
})
export class ShorturlModule {}
