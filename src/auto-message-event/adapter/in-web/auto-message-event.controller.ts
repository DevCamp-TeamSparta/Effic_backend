import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Inject,
  Logger,
  ParseIntPipe,
  Post,
  Put,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { CreateAutoMessageEventDto } from 'src/auto-message-event/application/port/in/dto/create-auto-message-event.dto';
import {
  IAutoMessageEventUseCase,
  IAutoMessageEventUseCaseSymbol,
} from 'src/auto-message-event/application/port/in/auto-message-event.use-case';
import { AutoMessageEventOrmEntity } from '../out-persistence/auto-message-event.orm.entity';
import { UpdateAutoMessageEventDto } from 'src/auto-message-event/application/port/in/dto/update-auto-message-event.dto';
import { AccessTokenGuard } from 'src/auth/guards/auth.guard';
import { ApiTags } from '@nestjs/swagger';
import { CreateAutoMessageEventInputDto } from 'src/auto-message-event/application/port/in/dto/create-auto-message-event-input.dto';
import { AutoMessageEventInputOrmEntity } from '../out-persistence/auto-message-event-input.orm.entity';

@Controller('auto-message-event')
@ApiTags('Auto Message Event API')
export class AutoMessageEventController {
  private logger = new Logger('AutoMessageEventController');
  constructor(
    @Inject(IAutoMessageEventUseCaseSymbol)
    private readonly autoMessageEventUseCase: IAutoMessageEventUseCase,
  ) {}

  @UseGuards(AccessTokenGuard)
  @Post()
  @HttpCode(HttpStatus.CREATED)
  async createAutoMessageEvent(
    @Req() req,
    @Body() dto: CreateAutoMessageEventDto,
  ): Promise<AutoMessageEventOrmEntity> {
    this.logger.verbose('createAutoMessageEvent');
    dto.email = req.payload.email;
    return this.autoMessageEventUseCase.createAutoMessageEvent(dto);
  }

  @UseGuards(AccessTokenGuard)
  @Get('/detail')
  async getAutoMessageEventDetail(
    @Req() req,
    @Query('autoMessageEventId', ParseIntPipe) autoMessageEventId: number,
  ): Promise<AutoMessageEventOrmEntity> {
    this.logger.verbose('getSegmentDetails');
    const email = req.payload.email;
    return this.autoMessageEventUseCase.getAutoMessageEventDetail(
      autoMessageEventId,
      email,
    );
  }

  @UseGuards(AccessTokenGuard)
  @Get('/all')
  @HttpCode(HttpStatus.OK)
  async getAllAutoMessageEvents(@Req() req): Promise<any> {
    this.logger.verbose('getAllAutoMessageEvents');
    const email = req.payload.email;
    return this.autoMessageEventUseCase.getAllAutoMessageEvents(email);
  }

  @UseGuards(AccessTokenGuard)
  @Put()
  @HttpCode(HttpStatus.OK)
  async updateAutoMessageEvent(
    @Req() req,
    @Body() dto: UpdateAutoMessageEventDto,
  ): Promise<any> {
    this.logger.verbose('updateAutoMessageEvent');
    dto.email = req.payload.email;
    return this.autoMessageEventUseCase.updateAutoMessageEvent(dto);
  }

  @UseGuards(AccessTokenGuard)
  @Delete()
  @HttpCode(HttpStatus.OK)
  async deleteAutoMessageEvent(
    @Req() req,
    @Body('autoMessageEventId') autoMessageEventId: number,
  ): Promise<any> {
    this.logger.verbose('deleteAutoMessageEvent');
    const email = req.payload.email;
    return this.autoMessageEventUseCase.deleteAutoMessageEvent(
      autoMessageEventId,
      email,
    );
  }

  @UseGuards(AccessTokenGuard)
  @Post('/input')
  @HttpCode(HttpStatus.CREATED)
  async createAutoMessageEventInput(
    @Body() dto: CreateAutoMessageEventInputDto,
  ): Promise<AutoMessageEventInputOrmEntity> {
    this.logger.verbose('createAutoMessageEventInput');
    return this.autoMessageEventUseCase.createAutoMessageEventInput(dto);
  }

  @UseGuards(AccessTokenGuard)
  @Get('/input/detail')
  async getAutoMessageEventInputDetail(
    @Req() req,
    @Query('autoMessageEventInputId', ParseIntPipe)
    autoMessageEventInputId: number,
  ): Promise<AutoMessageEventInputOrmEntity> {
    this.logger.verbose('getAutoMessageEventInputDetail');
    return await this.autoMessageEventUseCase.getAutoMessageEventInputDetail(
      autoMessageEventInputId,
    );
  }
}
