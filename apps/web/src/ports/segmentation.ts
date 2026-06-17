export interface BoundingBox {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface SegmentationResult {
  /** URL of the cropped/masked furniture image. */
  croppedImageUrl: string;
  /** Bounding box of the detected furniture within the source photo, in pixels. */
  boundingBox: BoundingBox;
}

/**
 * Abstraction over whatever turns a cell photo into an extracted piece of
 * furniture. PRD.md/PLAN.md call for automatic segmentation from the start,
 * but the concrete model/service (self-hosted vs. external API) is still an
 * open decision (PRD.md 13절) — so for now every caller depends on this
 * interface and a stub implementation, not a real model.
 */
export interface SegmentationPort {
  segment(imageUrl: string): Promise<SegmentationResult>;
}

/**
 * Placeholder segmenter: "detects" the entire source image as a single
 * furniture region. Lets the rest of the pipeline (extraction -> icon
 * conversion -> grid placement) be built and tested now; swap this out
 * once a real model/service is chosen.
 */
export class StubSegmentationProvider implements SegmentationPort {
  constructor(private readonly assumedSize: BoundingBox = { x: 0, y: 0, width: 200, height: 200 }) {}

  async segment(imageUrl: string): Promise<SegmentationResult> {
    return {
      croppedImageUrl: imageUrl,
      boundingBox: this.assumedSize,
    };
  }
}
