import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Inject,
  Post,
} from '@nestjs/common';
import {
  IClientDbService,
  IClientDbServiceSymbol,
} from './client-db.interface';

@Controller('client-db')
export class ClientDbController {
  constructor(
    @Inject(IClientDbServiceSymbol)
    private readonly clientDbService: IClientDbService,
  ) {}

  @Post('/connect')
  @HttpCode(HttpStatus.OK)
  async connectToDatabase(
    @Body()
    connectionDetails: {
      host: string;
      user: string;
      password: string;
      database: string;
      port: number;
    },
  ) {
    await this.clientDbService.connectToDb(connectionDetails);
    const isConnected = await this.clientDbService.testConnection();
    if (!isConnected) {
      throw new Error('Failed to connect to database');
    }
  }

  @Get('/test')
  async testDatabaseConnection() {
    return await this.clientDbService.testConnection();
  }

  @Post('/query')
  async executeQuery(@Body('query') query: string) {
    return await this.clientDbService.executeQuery(query);
  }
}
