export interface CreateTargetReservationTime {
  targetIds: number[];
  segmentId: number;
  timeColumnName: string;
  receiverNumberColumnName: string;
  delayDays: number;
  reservationTime: Date;
}
