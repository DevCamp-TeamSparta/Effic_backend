import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ITargetPort } from 'src/target/application/port/out/target.port';
import { Repository } from 'typeorm';
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
      messageTitle: string;
      messageContent: string;
      receiverNumber: string;
      reservedAt: Date | null;
    },
    sentStatus: boolean,
  ) {
    const domainTarget = new Target(
      targetData.messageTitle,
      targetData.messageContent,
      targetData.reservedAt,
      targetData.receiverNumber,
      sentStatus,
    );

    const targetOrmEntity = TargetMapper.mapToTargetOrmEntity(domainTarget);
    await this.targetRepository.save(targetOrmEntity);
    return;
  }
}
