export interface CreateFilterQueryByVariableValueDto {
  segmentId: number;
  columnName: string;
  value: string;
  excludeValue: boolean;
}
