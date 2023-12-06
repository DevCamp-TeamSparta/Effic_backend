export interface ISmsPort {
  saveSms(smsContent: string, senderNumber: string): Promise<void>;
}

export const ISmsPortSymbol = Symbol('ISmsPortSymbol');
