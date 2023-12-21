export class AutoMessageEvent {
  public autoMessageEventName: string;
  public totalSentCount: number;
  public clickCount: number;
  public clickRate: number;
  public scheduledEndDate: Date;
  public createdDate: Date;
  public isActive: boolean;

  constructor(
    autoMessageEventName: string,
    totalSentCount: number,
    clickCount: number,
    clickRate: number,
    scheduledEndDate: Date,
    createdDate: Date,
    isActive: boolean,
  ) {
    this.autoMessageEventName = autoMessageEventName;
    this.totalSentCount = totalSentCount;
    this.clickCount = clickCount;
    this.clickRate = clickRate;
    this.scheduledEndDate = scheduledEndDate;
    this.createdDate = createdDate;
    this.isActive = isActive;
  }
}
