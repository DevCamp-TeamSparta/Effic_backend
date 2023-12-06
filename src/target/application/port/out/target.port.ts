export interface ITargetPort {
  saveTarget(
    targetData: {
      customerName: string;
      phoneNumber: string;
      sendDateTime: Date;
    },
    isRecurringTarget: boolean,
  ): Promise<void>;
}

export const ITargetPortSymbol = Symbol('ITargetPortSymbol');
