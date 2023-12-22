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
import { ConnectToDatabaseDto } from './connect-to-db.dto';

@Controller('client-db')
export class ClientDbController {
  constructor(
    @Inject(IClientDbServiceSymbol)
    private readonly clientDbService: IClientDbService,
  ) {}

  @Post('/connect')
  @HttpCode(HttpStatus.OK)
  async connectToDatabase(@Body() dto: ConnectToDatabaseDto) {
    await this.clientDbService.connectToDb(dto);
    const isConnected = await this.clientDbService.testConnection();
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
