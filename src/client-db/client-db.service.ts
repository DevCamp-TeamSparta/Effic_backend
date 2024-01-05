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
import { Pool, PoolConfig } from 'pg';

@Injectable()
export class ClientDbService implements IClientDbService {
  private logger = new Logger('ClientDbService');
  private connectionPool: mysql.Pool | null = null;
  private connectionPoolPg: Pool | null = null;

  constructor(
    @Inject(IClientDbPortSymbol)
    private readonly clientDbPort: IClientDbPort,
  ) {}

  async saveClinetDbInfo(dto: ConnectToDatabaseDto) {
    this.logger.verbose('saveClinetDbInfo');
    return await this.clientDbPort.saveClientDbInfo(dto);
  }

  /**
   * MySQL
   */

  async connectToMySQL(connectionDetails: mysql.PoolOptions): Promise<void> {
    this.logger.verbose('connectToDb');
    this.connectionPool = mysql.createPool({
      host: connectionDetails.host,
      user: connectionDetails.user,
      password: connectionDetails.password,
      database: connectionDetails.database,
      port: connectionDetails.port,
      connectionLimit: 10,
    });
    this.logger.log('MySQL connectionPool created...');
  }

  async testMySQLConnection(): Promise<boolean> {
    this.logger.verbose('testMySQLConnection');
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

  async executeQueryMySQL(query: string): Promise<any> {
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

  /**
   * PostgreSQL
   */

  async connectToPg(connectionDetailsPg: PoolConfig): Promise<void> {
    this.logger.verbose('connectToDb');
    this.connectionPoolPg = new Pool({
      host: connectionDetailsPg.host,
      user: connectionDetailsPg.user,
      password: connectionDetailsPg.password,
      database: connectionDetailsPg.database,
      port: connectionDetailsPg.port,
      max: 10,
    });

    if (this.connectionPoolPg)
      this.logger.log('PostgreSQL connectionPool created...');

    const connection = await this.connectionPoolPg.connect();
  }

  async testPgConnection(): Promise<boolean> {
    this.logger.verbose('testConnection');
    if (!this.connectionPoolPg) return false;

    try {
      const connection = await this.connectionPoolPg.connect();

      const ping = await connection.query('SELECT 1');

      this.logger.log(`test connection status...${ping}`);
      connection.release();
      this.logger.log('test connection release...');
      return true;
    } catch (error) {
      this.logger.error(error);
      return false;
    }
  }

  async executeQueryPg(query: string): Promise<any> {
    if (!this.connectionPoolPg) {
      this.logger.error('Connection pool is not initialized');
      throw new InternalServerErrorException(
        'Connection pool is not initialized',
      );
    }

    try {
      const connection = await this.connectionPoolPg.connect();
      const ping = await connection.query('SELECT 1');
      this.logger.log(`connection status...${ping}`);
      try {
        this.logger.log(`executing query: ${query}`);
        const queryResult = await connection.query(query);
        return queryResult.rows;
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
