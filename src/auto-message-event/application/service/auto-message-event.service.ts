import {
  Inject,
  Injectable,
  Logger,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { CreateAutoMessageEventDto } from '../port/in/dto/create-auto-message-event.dto';
import { AutoMessageEvent } from 'src/auto-message-event/domain/auto-message-event';
import { IAutoMessageEventUseCase } from '../port/in/auto-message-event.use-case';
import {
  IAutoMessageEventPort,
  IAutoMessageEventPortSymbol,
} from '../port/out/auto-message-event.port';
import { AutoMessageEventOrmEntity } from 'src/auto-message-event/adapter/out-persistence/auto-message-event.orm.entity';
import { UpdateAutoMessageEventDto } from '../port/in/dto/update-auto-message-event.dto';
import { UsersService } from 'src/users/service/users.service';

@Injectable()
export class AutoMessageEventService implements IAutoMessageEventUseCase {
  private logger = new Logger('AutoMessageEventService');
  constructor(
    @Inject(IAutoMessageEventPortSymbol)
    private readonly autoMessageEventPort: IAutoMessageEventPort,
    private usersService: UsersService,
  ) {}
  async createAutoMessageEvent(
    dto: CreateAutoMessageEventDto,
  ): Promise<AutoMessageEventOrmEntity> {
    this.logger.verbose('createAutoMessageEvent');
    const {
      autoMessageEventName,
      scheduledEndDate,
      createdDate,
      isActive,
      email,
    } = dto;

    const newAutoMessageEvent = new AutoMessageEvent(
      autoMessageEventName,
      null,
      null,
      null,
      scheduledEndDate,
      createdDate,
      isActive,
    );

    const user = await this.usersService.checkUserInfo(email);

    return this.autoMessageEventPort.saveAutoMessageEvent(
      newAutoMessageEvent,
      user.userId,
    );
  }

  async getAutoMessageEventDetail(
    autoMessageEventId: number,
    email: string,
  ): Promise<AutoMessageEventOrmEntity> {
    this.logger.verbose('getAutoMessageEventDetail');
    const user = await this.usersService.checkUserInfo(email);

    const existingEvent =
      await this.autoMessageEventPort.getAutoMessageEventById(
        autoMessageEventId,
      );
    if (!existingEvent) throw new NotFoundException();
    if (user.userId !== existingEvent.userId) throw new UnauthorizedException();

    return existingEvent;
  }

  async getAllAutoMessageEvents(email: string): Promise<any> {
    this.logger.verbose('getAllAutoMessageEvents');
    const user = await this.usersService.checkUserInfo(email);
    return await this.autoMessageEventPort.getAllAutoMessageEvents(user.userId);
  }

  async updateAutoMessageEvent(
    dto: UpdateAutoMessageEventDto,
  ): Promise<AutoMessageEventOrmEntity> {
    this.logger.verbose('updateAutoMessageEvent');
    const {
      autoMessageEventId,
      autoMessageEventName,
      scheduledEndDate,
      email,
    } = dto;

    const user = await this.usersService.checkUserInfo(email);

    const existingEvent =
      await this.autoMessageEventPort.getAutoMessageEventById(
        autoMessageEventId,
      );
    if (!existingEvent) throw new NotFoundException();
    if (user.userId !== existingEvent.userId) throw new UnauthorizedException();

    if (autoMessageEventName !== undefined)
      existingEvent.autoMessageEventName = autoMessageEventName;

    if (scheduledEndDate !== undefined)
      existingEvent.scheduledEndDate = scheduledEndDate;

    return await this.autoMessageEventPort.updateAutoMessageEventById(
      autoMessageEventId,
      autoMessageEventName,
      scheduledEndDate,
    );
  }
}
