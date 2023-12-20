export class Target {
  public messageTitle: string;
  public messageContent: string;
  public reservedAt: Date | null;
  public sentStatus: boolean;
  public receiverNumber: string;

  constructor(
    messageTitle: string,
    messageContent: string,
    reservedAt: Date | null,
    receiverNumber: string,
    sentStatus = false,
  ) {
    this.messageTitle = messageTitle;
    this.messageContent = messageContent;
    this.reservedAt = reservedAt;
    this.sentStatus = sentStatus;
    this.receiverNumber = receiverNumber;
  }
}
