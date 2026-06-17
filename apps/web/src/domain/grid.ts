import type { Grid, Outline } from "./types";

export const MIN_CELL_SIZE_METERS = 0.1;
export const MAX_CELL_SIZE_METERS = 2;

export type GridValidationResult = { ok: true; grid: Grid } | { ok: false; errors: string[] };

/** Computes how many rows/cols a rectangular outline divides into for a given cell size. */
export function createGrid(floorplanId: string, outline: Outline, cellSizeMeters: number): GridValidationResult {
  if (
    !Number.isFinite(cellSizeMeters) ||
    cellSizeMeters < MIN_CELL_SIZE_METERS ||
    cellSizeMeters > MAX_CELL_SIZE_METERS
  ) {
    return {
      ok: false,
      errors: [`셀 크기는 ${MIN_CELL_SIZE_METERS}m ~ ${MAX_CELL_SIZE_METERS}m 사이여야 합니다.`],
    };
  }

  return {
    ok: true,
    grid: {
      floorplanId,
      rows: Math.ceil(outline.heightMeters / cellSizeMeters),
      cols: Math.ceil(outline.widthMeters / cellSizeMeters),
      cellSizeMeters,
    },
  };
}
