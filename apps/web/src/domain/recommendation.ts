import { findCollisions, type ItemPlacement } from "@ideal-potato/grid-canvas";
import type { CellPosition, FurnitureItem, Grid, LayoutPlacement } from "./types";

export interface RecommendationReason {
  itemId: string;
  text: string;
}

export interface RecommendationResult {
  placements: LayoutPlacement[];
  reasons: RecommendationReason[];
  /** Ids of items that could not be placed anywhere without overlapping another item. */
  unplaced: string[];
}

/** Row kept clear (when possible) as a walkway through the room, per PRD "동선 폭 확보". */
function walkwayRow(grid: Grid): number {
  return Math.floor(grid.rows / 2);
}

function overlapsWalkway(row: number, h: number, grid: Grid): boolean {
  const row0 = walkwayRow(grid);
  return row <= row0 && row0 < row + h;
}

/** Top-left anchors touching one of the four walls, ordered clockwise from the top-left corner. */
function wallAnchors(grid: Grid, w: number, h: number): CellPosition[] {
  const maxRow = grid.rows - h;
  const maxCol = grid.cols - w;
  if (maxRow < 0 || maxCol < 0) return [];

  const anchors: CellPosition[] = [];
  const seen = new Set<string>();
  function add(row: number, col: number) {
    const key = `${row}:${col}`;
    if (seen.has(key)) return;
    seen.add(key);
    anchors.push({ row, col });
  }

  for (let col = 0; col <= maxCol; col++) add(0, col);
  for (let row = 0; row <= maxRow; row++) add(row, maxCol);
  for (let col = maxCol; col >= 0; col--) add(maxRow, col);
  for (let row = maxRow; row >= 0; row--) add(row, 0);
  return anchors;
}

/** Every valid top-left anchor in reading order (row-major), used once wall positions are exhausted. */
function allAnchors(grid: Grid, w: number, h: number): CellPosition[] {
  const maxRow = grid.rows - h;
  const maxCol = grid.cols - w;
  if (maxRow < 0 || maxCol < 0) return [];

  const anchors: CellPosition[] = [];
  for (let row = 0; row <= maxRow; row++) {
    for (let col = 0; col <= maxCol; col++) anchors.push({ row, col });
  }
  return anchors;
}

function findFreeAnchor(
  candidates: CellPosition[],
  item: FurnitureItem,
  placed: ItemPlacement[],
  grid: Grid,
  avoidWalkway: boolean,
): CellPosition | undefined {
  return candidates.find((anchor) => {
    if (avoidWalkway && overlapsWalkway(anchor.row, item.size.h, grid)) return false;
    const candidate: ItemPlacement = { id: item.id, row: anchor.row, col: anchor.col, w: item.size.w, h: item.size.h };
    return findCollisions(placed, candidate).length === 0;
  });
}

/**
 * v1 heuristic recommender (PRD.md 9절 / PLAN.md Phase 4): bigger items go
 * against the walls first, a walkway row is kept clear when there's room for
 * one, and nothing is ever placed on top of another item. Larger items are
 * placed first since they have fewer valid spots.
 */
export function recommendPlacements(grid: Grid, items: FurnitureItem[]): RecommendationResult {
  const ordered = [...items].sort((a, b) => b.size.w * b.size.h - a.size.w * a.size.h || a.id.localeCompare(b.id));

  const placed: ItemPlacement[] = [];
  const placements: LayoutPlacement[] = [];
  const reasons: RecommendationReason[] = [];
  const unplaced: string[] = [];

  for (const item of ordered) {
    const { w, h } = item.size;

    const wallSpot = findFreeAnchor(wallAnchors(grid, w, h), item, placed, grid, true);
    const interiorSpot = wallSpot ? undefined : findFreeAnchor(allAnchors(grid, w, h), item, placed, grid, true);
    const anySpot = wallSpot ?? interiorSpot ?? findFreeAnchor(allAnchors(grid, w, h), item, placed, grid, false);

    if (!anySpot) {
      unplaced.push(item.id);
      continue;
    }

    placed.push({ id: item.id, row: anySpot.row, col: anySpot.col, w, h });
    placements.push({ itemId: item.id, row: anySpot.row, col: anySpot.col });
    reasons.push({
      itemId: item.id,
      text: wallSpot
        ? "벽 쪽에 배치해 동선을 확보했습니다."
        : interiorSpot
          ? "벽 자리가 없어 빈 공간에 배치했습니다."
          : "통로 공간을 일부 사용해 배치했습니다.",
    });
  }

  return { placements, reasons, unplaced };
}
