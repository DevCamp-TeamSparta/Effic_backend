export class Target {
  public targetName: string;
  public targetPhoneNumber: string;
  public sendDateTime: Date;

  constructor(
    targetName: string,
    targetPhoneNumber: string,
    sendDateTime: Date,
  ) {
    this.targetName = targetName;
    this.targetPhoneNumber = targetPhoneNumber;
    this.sendDateTime = sendDateTime;
  }
}
