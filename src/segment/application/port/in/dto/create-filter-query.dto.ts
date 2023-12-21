export interface CreateFilterQueryDto {
  segmentId: number;
  columnName: string;
  value: string;
  excludeValue: boolean;
}
