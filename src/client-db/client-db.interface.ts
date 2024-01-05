import { PoolConfig } from 'pg';
import { ConnectToDatabaseDto } from './connect-to-db.dto';
import * as mysql from 'mysql2/promise';
import { ClientDbOrmEntity } from './client-db.orm.entity';

export interface IClientDbService {
  saveClinetDbInfo(dto: ConnectToDatabaseDto): Promise<ClientDbOrmEntity>;
  connectToMySQL(connectionDetails: mysql.PoolOptions): Promise<void>;
  testMySQLConnection(): Promise<boolean>;
  executeQueryMySQL(query: string): Promise<any>;
  connectToPg(connectionDetailsPg: PoolConfig): Promise<void>;
  testPgConnection(): Promise<boolean>;
  executeQueryPg(query: string): Promise<any>;
}

export const IClientDbServiceSymbol = Symbol('IClientDbServiceSymbol');
