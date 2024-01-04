export class Target {
  public messageTitle: string;
  public messageContent: string;
  public reservedAt: Date | null;
  public sentStatus: boolean;
  public receiverNumber: string;
  public hostnumber: string;
  public advertiseInfo: boolean;
  public email: string;

  constructor(
    messageTitle: string,
    messageContent: string,
    reservedAt: Date | null,
    receiverNumber: string,
    sentStatus = false,
    hostnumber: string,
    advertiseInfo: boolean,
    email: string,
  ) {
    this.messageTitle = messageTitle;
    this.messageContent = messageContent;
    this.reservedAt = reservedAt;
    this.sentStatus = sentStatus;
    this.receiverNumber = receiverNumber;
    this.hostnumber = hostnumber;
    this.advertiseInfo = advertiseInfo;
    this.email = email;
  }
}
