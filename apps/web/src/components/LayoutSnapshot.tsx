import { cellToPixel } from "@ideal-potato/grid-canvas";
import { resolvePlacements } from "../domain/layout";
import type { FurnitureItem, Grid, LayoutPlacement } from "../domain/types";

export interface LayoutSnapshotProps {
  grid: Grid;
  items: FurnitureItem[];
  placements: LayoutPlacement[];
  /** Pixel size of one grid cell on screen. */
  pixelsPerCell?: number;
  label: string;
}

/** Read-only rendering of a set of placements, used to compare saved layouts side by side. */
export function LayoutSnapshot({ grid, items, placements, pixelsPerCell = 48, label }: LayoutSnapshotProps) {
  const resolved = resolvePlacements(items, placements);
  const itemById = new Map(items.map((item) => [item.id, item]));
  const gridConfig = { rows: grid.rows, cols: grid.cols, cellSize: pixelsPerCell };

  return (
    <div className="flex flex-col gap-2">
      <h4 className="font-semibold">{label}</h4>
      <div
        data-testid="layout-snapshot"
        style={{
          position: "relative",
          width: grid.cols * pixelsPerCell,
          height: grid.rows * pixelsPerCell,
        }}
        className="border"
      >
        {resolved.map((placement) => {
          const item = itemById.get(placement.itemId);
          if (!item) return null;
          const { x, y } = cellToPixel(gridConfig, placement);
          return (
            <div
              key={placement.itemId}
              data-item-id={placement.itemId}
              title={item.name}
              style={{
                position: "absolute",
                left: x,
                top: y,
                width: item.size.w * pixelsPerCell,
                height: item.size.h * pixelsPerCell,
                backgroundImage: item.iconImageUrl ? `url(${item.iconImageUrl})` : undefined,
                backgroundSize: "contain",
                backgroundRepeat: "no-repeat",
                backgroundPosition: "center",
              }}
              className="box-border border border-gray-300"
            />
          );
        })}
      </div>
    </div>
  );
}
