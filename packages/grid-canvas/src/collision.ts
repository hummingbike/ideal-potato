import type { CellPosition, ItemPlacement, ItemSize } from "./types";

function overlaps(a: CellPosition & ItemSize, b: CellPosition & ItemSize): boolean {
  const aLeft = a.col;
  const aRight = a.col + a.w;
  const aTop = a.row;
  const aBottom = a.row + a.h;

  const bLeft = b.col;
  const bRight = b.col + b.w;
  const bTop = b.row;
  const bBottom = b.row + b.h;

  return aLeft < bRight && aRight > bLeft && aTop < bBottom && aBottom > bTop;
}

/**
 * Returns the items that would overlap a candidate placement, excluding any
 * existing item with the same id (so moving an item doesn't collide with itself).
 */
export function findCollisions(
  items: readonly ItemPlacement[],
  candidate: CellPosition & ItemSize & { id: string },
): ItemPlacement[] {
  return items.filter((item) => item.id !== candidate.id && overlaps(item, candidate));
}

export function hasCollision(
  items: readonly ItemPlacement[],
  candidate: CellPosition & ItemSize & { id: string },
): boolean {
  return findCollisions(items, candidate).length > 0;
}
