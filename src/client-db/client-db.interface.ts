import { PoolConfig } from 'pg';
import { ConnectToDatabaseDto } from './connect-to-db.dto';
import * as mysql from 'mysql2/promise';

export interface IClientDbService {
  connectToMySQL(connectionDetails: mysql.PoolOptions): Promise<void>;
  testMySQLConnection(): Promise<boolean>;
  executeQueryMySQL(query: string): Promise<any>;
  saveClinetDbInfo(dto: ConnectToDatabaseDto): Promise<void>;
  connectToPg(connectionDetailsPg: PoolConfig): Promise<void>;
  testPgConnection(): Promise<boolean>;
  executeQueryPg(query: string): Promise<any>;
}

export const IClientDbServiceSymbol = Symbol('IClientDbServiceSymbol');
