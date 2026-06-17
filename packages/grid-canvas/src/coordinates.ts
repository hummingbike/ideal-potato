import type { CellPosition, GridConfig, ItemSize, PixelPosition } from "./types";

export function cellToPixel(grid: GridConfig, cell: CellPosition): PixelPosition {
  return { x: cell.col * grid.cellSize, y: cell.row * grid.cellSize };
}

export function pixelToCell(grid: GridConfig, pixel: PixelPosition): CellPosition {
  return {
    row: Math.round(pixel.y / grid.cellSize),
    col: Math.round(pixel.x / grid.cellSize),
  };
}

/** Clamps a cell position so the item of the given size stays fully inside the grid. */
export function clampToGrid(grid: GridConfig, cell: CellPosition, size: ItemSize): CellPosition {
  const maxRow = Math.max(grid.rows - size.h, 0);
  const maxCol = Math.max(grid.cols - size.w, 0);
  return {
    row: Math.min(Math.max(cell.row, 0), maxRow),
    col: Math.min(Math.max(cell.col, 0), maxCol),
  };
}
