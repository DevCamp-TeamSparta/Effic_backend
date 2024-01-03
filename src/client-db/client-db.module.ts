import { Global, Module } from '@nestjs/common';
import { ClientDbController } from './client-db.controller';
import { ClientDbService } from './client-db.service';
import { IClientDbServiceSymbol } from './client-db.interface';
import { IClientDbPortSymbol } from './client-db.port';
import { ClinetDbRepository } from './client-db.repository';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ClientDbOrmEntity } from './client-db.orm.entity';

@Global()
@Module({
  imports: [TypeOrmModule.forFeature([ClientDbOrmEntity])],
  controllers: [ClientDbController],
  providers: [
    {
      provide: IClientDbServiceSymbol,
      useClass: ClientDbService,
    },
    {
      provide: IClientDbPortSymbol,
      useClass: ClinetDbRepository,
    },
  ],
  exports: [IClientDbServiceSymbol],
})
export class ClientDbModule {}
