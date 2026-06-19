import { describe, expect, it } from "vitest";
import { HeuristicRecommendationProvider } from "../../src/ports/recommendation";
import type { FurnitureItem, Grid } from "../../src/domain/types";

const grid: Grid = { floorplanId: "fp-1", rows: 4, cols: 4, cellSizeMeters: 0.5 };

const desk: FurnitureItem = {
  id: "desk-1",
  name: "책상",
  category: "desk",
  size: { w: 1, h: 1 },
  originalImageUrl: "memory://desk.png",
  sourceCell: { row: 2, col: 2 },
};

describe("HeuristicRecommendationProvider", () => {
  it("resolves with a recommendation built from the local heuristic", async () => {
    const provider = new HeuristicRecommendationProvider();
    const result = await provider.recommend(grid, [desk]);

    expect(result.placements).toEqual([{ itemId: "desk-1", row: 0, col: 0 }]);
    expect(result.unplaced).toEqual([]);
    expect(result.reasons).toHaveLength(1);
  });
});
