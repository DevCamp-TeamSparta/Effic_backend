export interface ITargetPort {
  saveTarget(
    targetData: {
      customerName: string;
      phoneNumber: string;
      sendDateTime: Date;
    },
    isRecurringTarget: boolean,
  ): Promise<void>;
  removeTargetsByNames(names: string[]): Promise<void>;
}

export const ITargetPortSymbol = Symbol('ITargetPortSymbol');
