import { Module } from '@nestjs/common';
import { ClientDbController } from './client-db.controller';
import { ClientDbService } from './client-db.service';
import { IClientDbServiceSymbol } from './client-db.interface';

@Module({
  controllers: [ClientDbController],
  providers: [
    {
      provide: IClientDbServiceSymbol,
      useClass: ClientDbService,
    },
  ],
})
export class ClientDbModule {}
