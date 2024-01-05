import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Inject,
  InternalServerErrorException,
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

    await this.clientDbService.connectToPg(dto);
    const ping = await this.clientDbService.testPgConnection();
    if (!ping)
      throw new InternalServerErrorException(
        'Failed to connect to the database',
      );
    return await this.clientDbService.saveClinetDbInfo(dto);
  }

  /**MySQL */

  @Post('/connect/mysql')
  @HttpCode(HttpStatus.OK)
  async connectToMySQL(@Body() dto: ConnectToDatabaseDto) {
    this.logger.verbose('connectToMySQL');
    await this.clientDbService.connectToMySQL(dto);
    return await this.clientDbService.testMySQLConnection();
  }

  @Get('/test/mysql')
  async testMySQLConnection() {
    this.logger.verbose('testMySQLConnection');
    return await this.clientDbService.testMySQLConnection();
  }

  @Post('/query/mysql')
  async executeQueryMySQL(@Body('query') query: string) {
    this.logger.verbose('executeQueryMySQL');
    return await this.clientDbService.executeQueryMySQL(query);
  }

  /**PostgreSQL */

  @Post('/connect/pg')
  @HttpCode(HttpStatus.OK)
  async connectToPg(@Body() dto: ConnectToDatabaseDto) {
    this.logger.verbose('connectToPg');
    await this.clientDbService.connectToPg(dto);
    return await this.clientDbService.testPgConnection();
  }

  @Post('/query/pg')
  async executeQueryPg(@Body('query') query: string) {
    this.logger.verbose('executeQuery');
    return await this.clientDbService.executeQueryPg(query);
  }
}
