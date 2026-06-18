import { describe, expect, it, vi } from "vitest";
import { extractFurniture } from "../../src/domain/furnitureExtraction";
import type { SegmentationPort } from "../../src/ports/segmentation";

describe("extractFurniture", () => {
  it("segments the photo and maps the result onto a FurnitureItem", async () => {
    const segmenter: SegmentationPort = {
      segment: vi.fn().mockResolvedValue({
        croppedImageUrl: "memory://cells/0-0-cropped.png",
        boundingBox: { x: 10, y: 10, width: 80, height: 60 },
      }),
    };

    const item = await extractFurniture(segmenter, {
      id: "desk-1",
      name: "책상",
      category: "desk",
      imageUrl: "memory://cells/0-0.png",
      sourceCell: { row: 0, col: 0 },
      size: { w: 2, h: 1 },
    });

    expect(segmenter.segment).toHaveBeenCalledWith("memory://cells/0-0.png");
    expect(item).toEqual({
      id: "desk-1",
      name: "책상",
      category: "desk",
      size: { w: 2, h: 1 },
      originalImageUrl: "memory://cells/0-0.png",
      segmentedImageUrl: "memory://cells/0-0-cropped.png",
      boundingBox: { x: 10, y: 10, width: 80, height: 60 },
      sourceCell: { row: 0, col: 0 },
    });
  });
});
