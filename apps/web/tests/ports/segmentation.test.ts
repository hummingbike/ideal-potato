import { describe, expect, it } from "vitest";
import { StubSegmentationProvider } from "../../src/ports/segmentation";

describe("StubSegmentationProvider", () => {
  it("returns the source image as the cropped result", async () => {
    const segmenter = new StubSegmentationProvider();
    const result = await segmenter.segment("memory://cells/0-0.png");
    expect(result.croppedImageUrl).toBe("memory://cells/0-0.png");
  });

  it("defaults to a 200x200 bounding box", async () => {
    const segmenter = new StubSegmentationProvider();
    const result = await segmenter.segment("memory://cells/0-0.png");
    expect(result.boundingBox).toEqual({ x: 0, y: 0, width: 200, height: 200 });
  });

  it("uses a custom assumed size when provided", async () => {
    const segmenter = new StubSegmentationProvider({ x: 0, y: 0, width: 80, height: 120 });
    const result = await segmenter.segment("memory://cells/0-0.png");
    expect(result.boundingBox).toEqual({ x: 0, y: 0, width: 80, height: 120 });
  });
});
