import { Controller, Get, Logger, Param, Headers } from '@nestjs/common';
import { ResultsService } from '../service/results.service';

@Controller('results')
export class ResultsController {
  private logger = new Logger('ResultsController');
  constructor(private resultsService: ResultsService) {}

  @Get('/default/:messageId')
  async defaultMessageResult(@Param('messageId') messageId: number) {
    this.logger.verbose('Default message result');
    return await this.resultsService.shortUrlResult(messageId);
  }

  @Get('/default/ncp/:messageId')
  async defaultMessageNcpResult(
    @Param('messageId') messageId: number,
    @Headers('email') headerEmail: string,
  ) {
    this.logger.verbose('Default message ncp result');
    return await this.resultsService.ncpResult(messageId, headerEmail);
  }
}
