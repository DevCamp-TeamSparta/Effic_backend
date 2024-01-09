interface TargetData {
  targetId?: number;
  sentStatus?: boolean;
  messageTitle: string;
  messageContent: string;
  receiverNumber: string;
  reservedAt: Date | null;
  hostnumber: string;
  advertiseInfo: boolean;
  email: string;
  autoMessageEventId: number;
}
