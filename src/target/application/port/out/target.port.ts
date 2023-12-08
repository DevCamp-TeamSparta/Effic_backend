export interface ITargetPort {
  saveTarget(
    targetData: {
      customerName: string;
      phoneNumber: string;
      sendDateTime: Date;
    },
    isRecurringTarget: boolean,
  ): Promise<void>;
  removeTargetsByPhoneNumbers(phoneNumbers: string[]): Promise<void>;
}

export const ITargetPortSymbol = Symbol('ITargetPortSymbol');
