import type { BoundingBox } from "../ports/segmentation";

export interface Outline {
  /** Room width in meters. */
  widthMeters: number;
  /** Room height (depth) in meters. */
  heightMeters: number;
}

export interface Floorplan {
  id: string;
  name: string;
  outline: Outline;
  createdAt: string;
}

export interface Grid {
  floorplanId: string;
  rows: number;
  cols: number;
  /** Real-world size of one square cell, in meters. */
  cellSizeMeters: number;
}

export interface Cell {
  row: number;
  col: number;
  photoUrl?: string;
}

export interface CellPosition {
  row: number;
  col: number;
}

export interface ItemSize {
  /** Width in grid cells. */
  w: number;
  /** Height in grid cells. */
  h: number;
}

export interface FurnitureItem {
  id: string;
  name: string;
  category: string;
  size: ItemSize;
  originalImageUrl: string;
  segmentedImageUrl?: string;
  iconImageUrl?: string;
  /** Detected furniture region within the original photo, in source-image pixels; user-correctable. */
  boundingBox?: BoundingBox;
  sourceCell: CellPosition;
}

export interface LayoutPlacement extends CellPosition {
  itemId: string;
}

export interface Layout {
  id: string;
  floorplanId: string;
  name: string;
  createdAt: string;
  placements: LayoutPlacement[];
}
