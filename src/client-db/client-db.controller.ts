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
import { ApiTags } from '@nestjs/swagger';

@Controller('client-db')
@ApiTags('Client DB API')
export class ClientDbController {
  private logger = new Logger('ClientDbController');
  constructor(
    @Inject(IClientDbServiceSymbol)
    private readonly clientDbService: IClientDbService,
  ) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async saveClientDbInfo(@Body() dto: ConnectToDatabaseDto) {
    this.logger.verbose('saveClientDbInfo');
    return await this.clientDbService.saveClinetDbInfo(dto);
  }

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
