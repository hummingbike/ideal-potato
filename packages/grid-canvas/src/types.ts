export interface GridConfig {
  rows: number;
  cols: number;
  /** Pixel size of one square cell. */
  cellSize: number;
}

export interface CellPosition {
  row: number;
  col: number;
}

export interface PixelPosition {
  x: number;
  y: number;
}

export interface ItemSize {
  /** Width in grid cells. */
  w: number;
  /** Height in grid cells. */
  h: number;
}

export interface ItemPlacement extends CellPosition, ItemSize {
  id: string;
}
