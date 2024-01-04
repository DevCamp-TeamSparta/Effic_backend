import { Target } from 'src/target/domain/target';
import { TargetOrmEntity } from './target.orm.entity';

export class TargetMapper {
  static mapToTarget(targetOrm: TargetOrmEntity): Target {
    return new Target(
      targetOrm.messageTitle,
      targetOrm.messageContent,
      targetOrm.reservedAt,
      targetOrm.receiverNumber,
      targetOrm.sentStatus,
      targetOrm.hostnumber,
      targetOrm.advertiseInfo,
      targetOrm.email,
    );
  }

  static mapToTargetOrmEntity(target: Target): TargetOrmEntity {
    const targetOrm = new TargetOrmEntity();
    targetOrm.messageTitle = target.messageTitle;
    targetOrm.messageContent = target.messageContent;
    targetOrm.reservedAt = target.reservedAt;
    targetOrm.sentStatus = target.sentStatus;
    targetOrm.receiverNumber = target.receiverNumber;
    targetOrm.hostnumber = target.hostnumber;
    targetOrm.advertiseInfo = target.advertiseInfo;
    targetOrm.email = target.email;
    return targetOrm;
  }
}
