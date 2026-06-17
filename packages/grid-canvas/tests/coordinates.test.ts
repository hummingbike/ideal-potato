import { describe, expect, it } from "vitest";
import { cellToPixel, clampToGrid, pixelToCell } from "../src/coordinates";
import type { GridConfig } from "../src/types";

const grid: GridConfig = { rows: 10, cols: 8, cellSize: 40 };

describe("cellToPixel", () => {
  it("converts a cell position to its top-left pixel position", () => {
    expect(cellToPixel(grid, { row: 2, col: 3 })).toEqual({ x: 120, y: 80 });
  });

  it("returns the origin for cell (0,0)", () => {
    expect(cellToPixel(grid, { row: 0, col: 0 })).toEqual({ x: 0, y: 0 });
  });
});

describe("pixelToCell", () => {
  it("rounds a pixel position to the nearest cell", () => {
    expect(pixelToCell(grid, { x: 121, y: 79 })).toEqual({ row: 2, col: 3 });
  });

  it("rounds down when closer to the lower cell", () => {
    expect(pixelToCell(grid, { x: 15, y: 15 })).toEqual({ row: 0, col: 0 });
  });
});

describe("clampToGrid", () => {
  it("leaves an in-bounds position untouched", () => {
    expect(clampToGrid(grid, { row: 3, col: 4 }, { w: 1, h: 1 })).toEqual({ row: 3, col: 4 });
  });

  it("clamps negative positions to 0", () => {
    expect(clampToGrid(grid, { row: -2, col: -5 }, { w: 1, h: 1 })).toEqual({ row: 0, col: 0 });
  });

  it("clamps positions so the item's far edge stays inside the grid", () => {
    expect(clampToGrid(grid, { row: 9, col: 7 }, { w: 2, h: 2 })).toEqual({ row: 8, col: 6 });
  });

  it("clamps to 0 when the item is larger than the grid", () => {
    expect(clampToGrid(grid, { row: 5, col: 5 }, { w: 20, h: 20 })).toEqual({ row: 0, col: 0 });
  });
});
