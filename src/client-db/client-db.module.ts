import { Global, Module } from '@nestjs/common';
import { ClientDbController } from './client-db.controller';
import { ClientDbService } from './client-db.service';
import { IClientDbServiceSymbol } from './client-db.interface';

@Global()
@Module({
  controllers: [ClientDbController],
  providers: [
    {
      provide: IClientDbServiceSymbol,
      useClass: ClientDbService,
    },
  ],
  exports: [IClientDbServiceSymbol],
})
export class ClientDbModule {}
