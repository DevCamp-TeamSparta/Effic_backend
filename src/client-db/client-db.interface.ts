import { ConnectToDatabaseDto } from './connect-to-db.dto';

export interface IClientDbService {
  connectToDb(connectionDetails: any): Promise<void>;
  testConnection(): Promise<boolean>;
  executeQuery(query: string): Promise<any>;
  saveClinetDbInfo(dto: ConnectToDatabaseDto);
}

export const IClientDbServiceSymbol = Symbol('IClientDbServiceSymbol');
