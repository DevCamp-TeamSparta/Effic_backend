import { Controller, Logger, Get } from '@nestjs/common';
import { ShorturlService } from '../service/shorturl.service';
import { ApiTags } from '@nestjs/swagger';

@Controller('shorturl')
@ApiTags('Shorturl API')
export class ShorturlController {
  private logger = new Logger('ShorturlController');
  constructor(private shorturlService: ShorturlService) {}

  //test용입니다. 실제로 사용되지 않습니다.
  @Get('/tlyinfo')
  async tlyInfo() {
    this.logger.verbose('TLY info');
    const isString = 'https://t.ly/LTMH5';
    return await this.shorturlService.getTlyInfo(isString);
  }
}
