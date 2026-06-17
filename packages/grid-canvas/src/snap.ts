import { clampToGrid, pixelToCell } from "./coordinates";
import type { CellPosition, GridConfig, ItemSize, PixelPosition } from "./types";

/**
 * Converts a free pixel position to the nearest valid cell position for an
 * item of the given size, clamped so the item stays fully inside the grid.
 */
export function snapToGrid(grid: GridConfig, pixel: PixelPosition, size: ItemSize): CellPosition {
  const nearest = pixelToCell(grid, pixel);
  return clampToGrid(grid, nearest, size);
}
