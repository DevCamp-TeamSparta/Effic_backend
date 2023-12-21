export class Segment {
  public segmentName: string;
  public segmentDescription: string;
  public createdAt: Date;
  public updatedAt: Date | null;
  public segmentQuery: string | null;
  public filterQuery: string | null;

  constructor(
    segmentName: string,
    segmentDescription: string,
    createdAt: Date,
    updatedAt: Date | null,
    segmentQuery: string | null,
    filterQuery: string | null,
  ) {
    this.segmentName = segmentName;
    this.segmentDescription = segmentDescription;
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
    this.segmentQuery = segmentQuery;
    this.filterQuery = filterQuery;
  }

  public updateSegmentQuery(newQuery: string | null): void {
    this.segmentQuery = newQuery;
  }
}
