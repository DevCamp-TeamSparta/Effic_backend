import { Module } from '@nestjs/common';
import { ResultsController } from './controller/results.controller';
import { ResultsService } from './service/results.service';

@Module({
  controllers: [ResultsController],
  providers: [ResultsService]
})
export class ResultsModule {}
