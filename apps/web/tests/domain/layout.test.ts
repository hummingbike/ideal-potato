import { describe, expect, it } from "vitest";
import { createLayout, resolvePlacements } from "../../src/domain/layout";
import type { FurnitureItem } from "../../src/domain/types";

const desk: FurnitureItem = {
  id: "desk-1",
  name: "책상",
  category: "desk",
  size: { w: 1, h: 1 },
  originalImageUrl: "memory://desk.png",
  sourceCell: { row: 0, col: 0 },
};

const chair: FurnitureItem = {
  id: "chair-1",
  name: "의자",
  category: "chair",
  size: { w: 1, h: 1 },
  originalImageUrl: "memory://chair.png",
  sourceCell: { row: 2, col: 2 },
};

describe("resolvePlacements", () => {
  it("uses the explicit placement when one exists for an item", () => {
    const result = resolvePlacements([desk], [{ itemId: "desk-1", row: 3, col: 1 }]);
    expect(result).toEqual([{ itemId: "desk-1", row: 3, col: 1 }]);
  });

  it("falls back to the item's source cell when no placement is given", () => {
    const result = resolvePlacements([chair], []);
    expect(result).toEqual([{ itemId: "chair-1", row: 2, col: 2 }]);
  });

  it("resolves each item independently", () => {
    const result = resolvePlacements([desk, chair], [{ itemId: "desk-1", row: 3, col: 1 }]);
    expect(result).toEqual([
      { itemId: "desk-1", row: 3, col: 1 },
      { itemId: "chair-1", row: 2, col: 2 },
    ]);
  });
});

describe("createLayout", () => {
  it("builds a Layout with resolved placements", () => {
    const layout = createLayout({
      id: "layout-1",
      floorplanId: "fp-1",
      name: "기본 배치",
      items: [desk, chair],
      placements: [{ itemId: "desk-1", row: 3, col: 1 }],
      createdAt: "2026-06-17T00:00:00.000Z",
    });

    expect(layout).toEqual({
      id: "layout-1",
      floorplanId: "fp-1",
      name: "기본 배치",
      createdAt: "2026-06-17T00:00:00.000Z",
      placements: [
        { itemId: "desk-1", row: 3, col: 1 },
        { itemId: "chair-1", row: 2, col: 2 },
      ],
    });
  });
});
