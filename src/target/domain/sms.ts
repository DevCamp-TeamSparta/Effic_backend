export class Sms {
  public smsContent: string;
  public senderNumber: string;

  constructor(smsContent: string, senderNumber: string) {
    this.smsContent = smsContent;
    this.senderNumber = senderNumber;
  }
}
