import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Inject,
  Logger,
  Post,
} from '@nestjs/common';
import {
  IClientDbService,
  IClientDbServiceSymbol,
} from './client-db.interface';
import { ConnectToDatabaseDto } from './connect-to-db.dto';

@Controller('client-db')
export class ClientDbController {
  private logger = new Logger('ClientDbController');
  constructor(
    @Inject(IClientDbServiceSymbol)
    private readonly clientDbService: IClientDbService,
  ) {}

  @Post('/connect')
  @HttpCode(HttpStatus.OK)
  async connectToDatabase(@Body() dto: ConnectToDatabaseDto) {
    this.logger.verbose('connectToDatabase');
    await this.clientDbService.connectToDb(dto);
    const isConnected = await this.clientDbService.testConnection();
  }

  @Get('/test')
  async testDatabaseConnection() {
    this.logger.verbose('testDatabaseConnection');
    return await this.clientDbService.testConnection();
  }

  @Post('/query')
  async executeQuery(@Body('query') query: string) {
    this.logger.verbose('executeQuery');
    return await this.clientDbService.executeQuery(query);
  }
}
