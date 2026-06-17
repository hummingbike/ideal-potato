import { describe, expect, it } from "vitest";
import { createGrid } from "../../src/domain/grid";

describe("createGrid", () => {
  it("computes rows/cols by dividing the outline by the cell size", () => {
    const result = createGrid("fp-1", { widthMeters: 4, heightMeters: 3 }, 0.5);
    expect(result).toEqual({
      ok: true,
      grid: { floorplanId: "fp-1", rows: 6, cols: 8, cellSizeMeters: 0.5 },
    });
  });

  it("rounds up partial cells so the grid always covers the full outline", () => {
    const result = createGrid("fp-1", { widthMeters: 4.2, heightMeters: 3.1 }, 0.5);
    expect(result).toEqual({
      ok: true,
      grid: { floorplanId: "fp-1", rows: 7, cols: 9, cellSizeMeters: 0.5 },
    });
  });

  it("rejects a cell size below the minimum", () => {
    const result = createGrid("fp-1", { widthMeters: 4, heightMeters: 3 }, 0.01);
    expect(result.ok).toBe(false);
  });

  it("rejects a cell size above the maximum", () => {
    const result = createGrid("fp-1", { widthMeters: 4, heightMeters: 3 }, 5);
    expect(result.ok).toBe(false);
  });
});
