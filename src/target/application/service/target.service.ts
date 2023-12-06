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
import { FilterTargetDto } from '../port/in/dto/filter-target.dto';
import { SmsTargetDto } from '../port/in/dto/sms-target.dto';
import { ISmsPort, ISmsPortSymbol } from '../port/out/sms.port';

@Injectable()
export class TargetService implements ITargetUseCase {
  constructor(
    @Inject(ISegmentPortSymbol)
    private readonly segmentPort: ISegmentPort,
    @Inject(IClientDbServiceSymbol)
    private readonly clientDbService: IClientDbService,
    @Inject(ITargetPortSymbol)
    private readonly targetPort: ITargetPort,
    @Inject(ISmsPortSymbol)
    private readonly smsPort: ISmsPort,
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

  async filterTarget(filterTargetDto: FilterTargetDto): Promise<void> {
    const { segmentId, columnName, filterData } = filterTargetDto;

    const segment = await this.segmentPort.getSegmentDetails(segmentId);
    let excuteQuery = segment.segmentQuery;

    console.log(columnName); // AgreeToMarketing
    console.log(filterData); // 0
    console.log(excuteQuery); // SELECT * FROM spartadb.customer;

    excuteQuery = excuteQuery.trim().slice(0, -1);

    const filterQuery = `${excuteQuery} WHERE ${columnName} = ${filterData};`;

    console.log(filterQuery);

    const queryResult = await this.clientDbService.executeQuery(filterQuery);

    const filterNames = queryResult.map((entry) => entry.CustomerName);

    console.log(filterNames); // [ '김민준', '이서윤', '박지호', '정하은', '최준서' ]

    // target 테이블에서 filterNames에 해당하는 이름인 레코드를 제거
    await this.targetPort.removeTargetsByNames(filterNames);
  }
  async smsTarget(smsTargetDto: SmsTargetDto): Promise<void> {
    const { smsContent, senderNumber } = smsTargetDto;

    await this.smsPort.saveSms(smsContent, senderNumber);
  }
}
