export interface CreateAutoMessageEventDto {
  autoMessageEventName: string;
  totalSentCount?: number | null;
  clickCount?: number | null;
  clickRate?: number | null;
  scheduledEndDate: Date;
  createdDate: Date;
  isActive: boolean;
}
