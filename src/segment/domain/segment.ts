export class Segment {
  public segmentName: string;
  public segmentDescription: string;
  public segmentQuery: string | null;
  public filterQuery: string | null;

  constructor(
    segmentName: string,
    segmentDescription: string,
    segmentQuery: string | null,
    filterQuery: string | null,
  ) {
    this.segmentName = segmentName;
    this.segmentDescription = segmentDescription;
    this.segmentQuery = segmentQuery;
    this.filterQuery = filterQuery;
  }

  public updateSegmentQuery(newQuery: string | null): void {
    this.segmentQuery = newQuery;
  }
}
