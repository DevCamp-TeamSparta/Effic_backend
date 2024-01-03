import {
  Inject,
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import * as mysql from 'mysql2/promise';
import { IClientDbService } from './client-db.interface';
import { ConnectToDatabaseDto } from './connect-to-db.dto';
import { IClientDbPort, IClientDbPortSymbol } from './client-db.port';

@Injectable()
export class ClientDbService implements IClientDbService {
  private logger = new Logger('ClientDbService');
  private connectionPool: mysql.Pool | null = null;

  constructor(
    @Inject(IClientDbPortSymbol)
    private readonly clientDbPort: IClientDbPort,
  ) {}

  async saveClinetDbInfo(dto: ConnectToDatabaseDto) {
    this.logger.verbose('saveClinetDbInfo');
    return await this.clientDbPort.saveClientDbInfo(dto);
  }

  async connectToDb(connectionDetails: mysql.PoolOptions): Promise<void> {
    this.logger.verbose('connectToDb');
    this.connectionPool = mysql.createPool({
      host: connectionDetails.host,
      user: connectionDetails.user,
      password: connectionDetails.password,
      database: connectionDetails.database,
      port: connectionDetails.port,
      connectionLimit: 10, // connection pool은 몇 개로 해야하는가?
    });
    this.logger.log('MySQL connectionPool created...');
  }

  async testConnection(): Promise<boolean> {
    this.logger.verbose('testConnection');
    if (!this.connectionPool) return false;

    try {
      const connection = await this.connectionPool.getConnection();
      const ping = await connection.ping();
      this.logger.log(`test connection status...${ping}`);
      connection.release();
      this.logger.log(`test connection release...`);
      return true;
    } catch (error) {
      this.logger.error(error);
      return false;
    }
  }

  async executeQuery(query: string): Promise<any> {
    if (!this.connectionPool) {
      this.logger.error('Connection pool is not initialized');
      throw new InternalServerErrorException(
        'Connection pool is not initialized',
      );
    }

    try {
      const connection = await this.connectionPool.getConnection();
      const ping = await connection.ping();
      this.logger.log(`connection status...${ping}`);
      try {
        this.logger.log(`executing query: ${query}`);
        const [rows] = await connection.query(query);
        return rows;
      } finally {
        connection.release();
        this.logger.log('connection release...');
      }
    } catch (error) {
      this.logger.error(error);
      throw new InternalServerErrorException();
    }
  }
}
