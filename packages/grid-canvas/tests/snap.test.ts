import { describe, expect, it } from "vitest";
import { snapToGrid } from "../src/snap";
import type { GridConfig } from "../src/types";

const grid: GridConfig = { rows: 6, cols: 6, cellSize: 50 };

describe("snapToGrid", () => {
  it("snaps a pixel position to the nearest cell", () => {
    expect(snapToGrid(grid, { x: 132, y: 24 }, { w: 1, h: 1 })).toEqual({ row: 0, col: 3 });
  });

  it("clamps the snapped position to stay inside the grid bounds", () => {
    expect(snapToGrid(grid, { x: 1000, y: 1000 }, { w: 2, h: 2 })).toEqual({ row: 4, col: 4 });
  });

  it("clamps negative pixel positions to the grid origin", () => {
    expect(snapToGrid(grid, { x: -80, y: -80 }, { w: 1, h: 1 })).toEqual({ row: 0, col: 0 });
  });
});
