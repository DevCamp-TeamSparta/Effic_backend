import { Controller, Logger } from '@nestjs/common';
import { ShorturlService } from '../service/shorturl.service';

@Controller('shorturl')
export class ShorturlController {
  private logger = new Logger('ShorturlController');
  constructor(private shorturlService: ShorturlService) {}
}
