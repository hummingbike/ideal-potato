import { LayoutSnapshot } from "./LayoutSnapshot";
import type { FurnitureItem, Grid, Layout } from "../domain/types";

export interface LayoutComparisonViewProps {
  grid: Grid;
  items: FurnitureItem[];
  before: Layout;
  after: Layout;
  pixelsPerCell?: number;
}

/** Renders two saved layouts side by side, read-only, to compare arrangements (PRD.md Phase 4 "레이아웃 비교 뷰"). */
export function LayoutComparisonView({ grid, items, before, after, pixelsPerCell }: LayoutComparisonViewProps) {
  return (
    <div data-testid="layout-comparison" className="flex flex-wrap gap-6">
      <LayoutSnapshot
        grid={grid}
        items={items}
        placements={before.placements}
        pixelsPerCell={pixelsPerCell}
        label={`이전: ${before.name}`}
      />
      <LayoutSnapshot
        grid={grid}
        items={items}
        placements={after.placements}
        pixelsPerCell={pixelsPerCell}
        label={`이후: ${after.name}`}
      />
    </div>
  );
}
