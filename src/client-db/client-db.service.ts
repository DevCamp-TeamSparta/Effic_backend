import { Injectable } from '@nestjs/common';
import * as mysql from 'mysql2/promise';
import { IClientDbService } from './client-db.interface';

@Injectable()
export class ClientDbService implements IClientDbService {
  private connectionPool: mysql.Pool | null = null;

  async connectToDb(connectionDetails: mysql.PoolOptions): Promise<void> {
    this.connectionPool = mysql.createPool({
      host: connectionDetails.host,
      user: connectionDetails.user,
      password: connectionDetails.password,
      database: connectionDetails.database,
      port: connectionDetails.port,
      connectionLimit: 10, // connection pool은 몇 개로 해야하는가?
    });
    console.log('MySQL connectionPool created...');
  }

  async testConnection(): Promise<boolean> {
    if (!this.connectionPool) return false;

    try {
      const connection = await this.connectionPool.getConnection();
      const ping = await connection.ping();
      console.log('test connection status...', ping);
      connection.release();
      console.log('test connection release...');
      return true;
    } catch (error) {
      console.error('Error pinging database:', error);
      return false;
    }
  }

  async executeQuery(query: string): Promise<any> {
    if (!this.connectionPool) throw new Error('connectionPool error');
    try {
      const connection = await this.connectionPool.getConnection();
      const ping = await connection.ping();
      console.log('connection status...', ping);
      try {
        console.log('executing query: ', query);
        const [rows] = await connection.query(query);
        return rows;
      } finally {
        connection.release();
        console.log('connection release...');
      }
    } catch (error) {
      console.error('Error executing query:', error);
      throw error;
    }
  }
}
