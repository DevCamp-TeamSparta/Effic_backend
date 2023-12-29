import { BooleanExpression } from 'mongoose';
import { TargetOrmEntity } from 'src/target/adapter/out-persistence/target.orm.entity';

export interface ITargetPort {
  saveTarget(
    targetData: TargetData,
    sentStatus: boolean,
  ): Promise<TargetOrmEntity>;
  getReceiverNumbers(targetIds: number[]): Promise<any>;
  updateTargetReservationTime(
    targetId: number,
    reservedAt: Date,
  ): Promise<void>;
  deleteTarget(targetId: number): Promise<void>;
  createTarget(targetData: TargetData): Promise<TargetOrmEntity>;
  getTargetData(targetId: number): Promise<TargetOrmEntity | null>;
  getUnsentTargets(): Promise<TargetOrmEntity[]>;
  updateSentStatus(targetId: number, sentStatus: boolean): Promise<void>;
}

export const ITargetPortSymbol = Symbol('ITargetPortSymbol');
