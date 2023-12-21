export interface CreateTargetReservationTimeDto {
  targetIds: number[];
  segmentId: number;
  timeColumnName: string;
  receiverNumberColumnName: string;
  delayDays: number;
  reservationTime: Date;
  endDate?: Date;
  isRecurring?: boolean;
  weekDays?: string[];
}
