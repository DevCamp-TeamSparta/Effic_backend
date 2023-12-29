import { TargetOrmEntity } from 'src/target/adapter/out-persistence/target.orm.entity';

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
  deleteTarget(targetId: number): Promise<void>;
  createTarget(targetData: {
    messageTitle: string;
    messageContent: string;
    receiverNumber: string;
    reservedAt: Date | null;
    sentStatus: boolean;
  }): Promise<TargetOrmEntity>;
  getTargetData(targetId: number): Promise<TargetOrmEntity | null>;
}

export const ITargetPortSymbol = Symbol('ITargetPortSymbol');
