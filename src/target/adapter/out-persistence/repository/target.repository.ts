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
    const savedEntity = await this.targetRepository.save(targetOrmEntity);
    return savedEntity;
  }

  async getReceiverNumbers(targetIds: number[]): Promise<any> {
    // const target =  각 targetId에 대해 targetRepository.findByIds(targetId)
    // 각 target에 대해 target.targetId, target.receiverNumber를 묶기
    // 모든 targetIds에 대해 묶은 결과를 return

    const targets = await this.targetRepository.findBy({
      targetId: In(targetIds),
    });

    const receiverTargetMap: { [receiverNumber: string]: number } = {};
    targets.forEach((target) => {
      receiverTargetMap[target.receiverNumber] = target.targetId;
    });

    return receiverTargetMap;
  }

  async updateTargetReservationTime(
    targetId: number,
    reservedAt: Date,
  ): Promise<void> {
    const target = await this.targetRepository.findOne({
      where: { targetId },
    });

    if (!target) {
      throw new Error(`Target with ID ${targetId} not found`);
    }

    target.reservedAt = reservedAt;
    await this.targetRepository.save(target);
  }
}
