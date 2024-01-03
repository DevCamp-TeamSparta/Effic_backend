import { ConnectToDatabaseDto } from './connect-to-db.dto';

export interface IClientDbPort {
  saveClientDbInfo(dto: ConnectToDatabaseDto);
}

export const IClientDbPortSymbol = Symbol('IClientDbPortSymbol');
