import { TargetOrmEntity } from 'src/target/adapter/out-persistence/entity/target.orm.entity';

export interface ITargetPort {
  saveTarget(
    targetData: {
      messageTitle: string;
      messageContent: string;
      reservedAt: Date | null;
    },
    sentStatus: boolean,
  ): Promise<TargetOrmEntity>;
  getReceiverNumbers(targetIds: number[]): Promise<any>;
  updateTargetReservationTime(
    targetId: number,
    reservedAt: Date,
  ): Promise<void>;
}

export const ITargetPortSymbol = Symbol('ITargetPortSymbol');
