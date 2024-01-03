import { ClientDbOrmEntity } from './client-db.orm.entity';
import { ConnectToDatabaseDto } from './connect-to-db.dto';

export interface IClientDbPort {
  saveClientDbInfo(dto: ConnectToDatabaseDto);
  getClientDbInfo(clientDbId: number): Promise<ClientDbOrmEntity>;
}

export const IClientDbPortSymbol = Symbol('IClientDbPortSymbol');
