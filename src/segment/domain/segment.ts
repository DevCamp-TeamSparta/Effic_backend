export class Segment {
  public segmentName: string;
  public segmentDescription: string;
  public segmentQuery: string | null;

  constructor(
    segmentName: string,
    segmentDescription: string,
    segmentQuery: string | null,
  ) {
    this.segmentName = segmentName;
    this.segmentDescription = segmentDescription;
    this.segmentQuery = segmentQuery;
  }
}
