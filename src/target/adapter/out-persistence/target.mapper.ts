import { Target } from 'src/target/domain/target';
import { TargetOrmEntity } from './target.orm.entity';

export class TargetMapper {
  static mapToTarget(target: TargetOrmEntity) {
    const TargetEntity = new Target(
      target.targetName,
      target.targetPhoneNumber,
      target.sendDateTime,
    );
    return TargetEntity;
  }

  static mapToTargetOrmEntity(target: Target) {
    const targetEntity = new TargetOrmEntity();
    targetEntity.targetName = target.targetName;
    targetEntity.targetPhoneNumber = target.targetPhoneNumber;
    targetEntity.sendDateTime = target.sendDateTime;

    targetEntity.sentStatus = false;
    targetEntity.isRecurringTarget = false;
    targetEntity.smsId = 1; // FK 조건으로 인해 미리 넣어두기

    return targetEntity;
  }
}
