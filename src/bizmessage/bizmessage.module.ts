import { Module } from '@nestjs/common';
import { BizmessageController } from './controller/bizmessage.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BizmessageService } from './service/bizmessage.service';
import { BizmessageRepository } from './bizmessage.repository';
import { Bizmessage } from './bizmessage.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Bizmessage])],
  controllers: [BizmessageController],
  providers: [BizmessageService, BizmessageRepository],
  exports: [BizmessageService, BizmessageRepository],
})
export class BizmessageModule {}
