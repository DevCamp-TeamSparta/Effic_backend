import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Inject,
  Logger,
  Post,
  Put,
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

@Controller('auto-message-event')
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
}
