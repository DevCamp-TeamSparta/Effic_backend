export interface ITargetPort {
  saveTarget(
    targetData: {
      messageTitle: string;
      messageContent: string;
      reservedAt: Date | null;
    },
    sentStatus: boolean,
  ): Promise<void>;
}

export const ITargetPortSymbol = Symbol('ITargetPortSymbol');
