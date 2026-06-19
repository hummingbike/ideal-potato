import { findCollisions, type ItemPlacement } from "@ideal-potato/grid-canvas";
import { describe, expect, it } from "vitest";
import { recommendPlacements } from "../../src/domain/recommendation";
import type { FurnitureItem, Grid } from "../../src/domain/types";

function makeItem(id: string, w: number, h: number, sourceCell = { row: 0, col: 0 }): FurnitureItem {
  return {
    id,
    name: id,
    category: "기타",
    size: { w, h },
    originalImageUrl: `memory://${id}.png`,
    sourceCell,
  };
}

describe("recommendPlacements", () => {
  it("never overlaps placed items", () => {
    const grid: Grid = { floorplanId: "fp-1", rows: 4, cols: 4, cellSizeMeters: 0.5 };
    const items = [makeItem("bed", 2, 2), makeItem("desk", 1, 1), makeItem("chair", 1, 1)];

    const result = recommendPlacements(grid, items);

    const placed: ItemPlacement[] = result.placements.map((p) => {
      const item = items.find((i) => i.id === p.itemId)!;
      return { id: p.itemId, row: p.row, col: p.col, w: item.size.w, h: item.size.h };
    });
    for (const candidate of placed) {
      const others = placed.filter((p) => p.id !== candidate.id);
      expect(findCollisions(others, candidate)).toEqual([]);
    }
  });

  it("keeps every placement within the grid bounds", () => {
    const grid: Grid = { floorplanId: "fp-1", rows: 5, cols: 6, cellSizeMeters: 0.5 };
    const items = [makeItem("bed", 2, 3), makeItem("desk", 1, 2), makeItem("chair", 1, 1), makeItem("shelf", 2, 1)];

    const result = recommendPlacements(grid, items);

    for (const placement of result.placements) {
      const item = items.find((i) => i.id === placement.itemId)!;
      expect(placement.row).toBeGreaterThanOrEqual(0);
      expect(placement.col).toBeGreaterThanOrEqual(0);
      expect(placement.row + item.size.h).toBeLessThanOrEqual(grid.rows);
      expect(placement.col + item.size.w).toBeLessThanOrEqual(grid.cols);
    }
  });

  it("places the largest item against a wall (touching row 0, the last row, col 0, or the last col)", () => {
    const grid: Grid = { floorplanId: "fp-1", rows: 4, cols: 4, cellSizeMeters: 0.5 };
    const items = [makeItem("bed", 2, 2), makeItem("lamp", 1, 1)];

    const result = recommendPlacements(grid, items);

    const bedPlacement = result.placements.find((p) => p.itemId === "bed")!;
    const touchesWall =
      bedPlacement.row === 0 || bedPlacement.row + 2 === grid.rows || bedPlacement.col === 0 || bedPlacement.col + 2 === grid.cols;
    expect(touchesWall).toBe(true);
  });

  it("keeps the middle walkway row clear when items fit elsewhere", () => {
    const grid: Grid = { floorplanId: "fp-1", rows: 4, cols: 4, cellSizeMeters: 0.5 };
    const items = [makeItem("bed", 2, 2), makeItem("desk", 1, 1)];
    const walkwayRow = Math.floor(grid.rows / 2);

    const result = recommendPlacements(grid, items);

    for (const placement of result.placements) {
      const item = items.find((i) => i.id === placement.itemId)!;
      const occupiesWalkway = placement.row <= walkwayRow && walkwayRow < placement.row + item.size.h;
      expect(occupiesWalkway).toBe(false);
    }
  });

  it("falls back to using the walkway when the grid leaves no other option", () => {
    const grid: Grid = { floorplanId: "fp-1", rows: 1, cols: 3, cellSizeMeters: 0.5 };
    const items = [makeItem("stool", 1, 1)];

    const result = recommendPlacements(grid, items);

    expect(result.placements).toEqual([{ itemId: "stool", row: 0, col: 0 }]);
    expect(result.reasons[0]).toEqual({ itemId: "stool", text: "통로 공간을 일부 사용해 배치했습니다." });
  });

  it("returns a reason for every placed item", () => {
    const grid: Grid = { floorplanId: "fp-1", rows: 4, cols: 4, cellSizeMeters: 0.5 };
    const items = [makeItem("bed", 2, 2), makeItem("desk", 1, 1)];

    const result = recommendPlacements(grid, items);

    expect(result.reasons.map((r) => r.itemId).sort()).toEqual(["bed", "desk"]);
    expect(result.unplaced).toEqual([]);
  });

  it("marks an item as unplaced when it cannot fit anywhere in the grid", () => {
    const grid: Grid = { floorplanId: "fp-1", rows: 1, cols: 1, cellSizeMeters: 0.5 };
    const items = [makeItem("wardrobe", 2, 2)];

    const result = recommendPlacements(grid, items);

    expect(result.placements).toEqual([]);
    expect(result.unplaced).toEqual(["wardrobe"]);
  });

  it("marks later items as unplaced once the grid is full", () => {
    const grid: Grid = { floorplanId: "fp-1", rows: 1, cols: 1, cellSizeMeters: 0.5 };
    const items = [makeItem("a", 1, 1), makeItem("b", 1, 1)];

    const result = recommendPlacements(grid, items);

    expect(result.placements).toEqual([{ itemId: "a", row: 0, col: 0 }]);
    expect(result.unplaced).toEqual(["b"]);
  });
});
