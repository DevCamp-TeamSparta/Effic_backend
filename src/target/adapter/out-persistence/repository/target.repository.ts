import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ITargetPort } from 'src/target/application/port/out/target.port';
import { Repository, In } from 'typeorm';
import { TargetOrmEntity } from '../entity/target.orm.entity';
import { TargetMapper } from '../mapper/target.mapper';
import { Target } from 'src/target/domain/target';

@Injectable()
export class TargetRepository implements ITargetPort {
  constructor(
    @InjectRepository(TargetOrmEntity)
    private readonly targetRepository: Repository<TargetOrmEntity>,
  ) {}

  async saveTarget(
    targetData: {
      customerName: string;
      phoneNumber: string;
      sendDateTime: Date;
    },
    isRecurringTarget: boolean,
  ) {
    const domainTarget = new Target(
      targetData.customerName,
      targetData.phoneNumber,
      targetData.sendDateTime,
    );

    const targetOrmEntity = TargetMapper.mapToTargetOrmEntity(domainTarget);

    // Set additional properties
    targetOrmEntity.sentStatus = false;
    targetOrmEntity.isRecurringTarget = isRecurringTarget;
    targetOrmEntity.smsId = 1; // smsId는 우선 1, 다 같은 문자 메세지 내용으로 통일

    // 데이터베이스에 저장
    await this.targetRepository.save(targetOrmEntity);

    return;
  }

  async removeTargetsByPhoneNumbers(phoneNumbers: string[]): Promise<void> {
    await this.targetRepository.delete({
      targetPhoneNumber: In(phoneNumbers),
    });
  }
}
