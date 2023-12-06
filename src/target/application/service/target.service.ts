import { Inject, Injectable } from '@nestjs/common';
import { ITargetUseCase } from '../port/in/target.use-case';
import {
  IClientDbService,
  IClientDbServiceSymbol,
} from 'src/client-db/client-db.interface';
import { CreateTargetDto } from '../port/in/dto/create-target.dto';
import {
  ISegmentPort,
  ISegmentPortSymbol,
} from 'src/segment/application/port/out/segment.port';
import { ITargetPort, ITargetPortSymbol } from '../port/out/target.port';

@Injectable()
export class TargetService implements ITargetUseCase {
  constructor(
    @Inject(ISegmentPortSymbol)
    private readonly segmentPort: ISegmentPort,
    @Inject(IClientDbServiceSymbol)
    private readonly clientDbService: IClientDbService,
    @Inject(ITargetPortSymbol)
    private readonly targetPort: ITargetPort,
  ) {}

  async createTarget(createTargetDto: CreateTargetDto): Promise<void> {
    const { segmentId, timeColumnName, sendTime } = createTargetDto;

    const segment = await this.segmentPort.getSegmentDetails(segmentId);

    const excuteQuery = segment.segmentQuery;

    const queryResult = await this.clientDbService.executeQuery(excuteQuery);

    const targets = queryResult.map((customer) => {
      const sendDateTime = new Date(customer[timeColumnName]);
      sendDateTime.setDate(sendDateTime.getDate() + sendTime);

      return {
        customerName: customer.CustomerName,
        phoneNumber: customer.PhoneNumber,
        sendDateTime: sendDateTime.toISOString(), // ISO 8601 형식
      };
    });

    for (const target of targets) {
      await this.targetPort.saveTarget(target, false);
    }
  }
}
