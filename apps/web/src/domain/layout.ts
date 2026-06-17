import type { FurnitureItem, Layout, LayoutPlacement } from "./types";

/** Resolves each item's placement, falling back to its source cell when none was given. */
export function resolvePlacements(items: FurnitureItem[], placements: LayoutPlacement[]): LayoutPlacement[] {
  const byItemId = new Map(placements.map((placement) => [placement.itemId, placement]));
  return items.map(
    (item) => byItemId.get(item.id) ?? { itemId: item.id, row: item.sourceCell.row, col: item.sourceCell.col },
  );
}

export interface CreateLayoutInput {
  id: string;
  floorplanId: string;
  name: string;
  items: FurnitureItem[];
  placements: LayoutPlacement[];
  createdAt: string;
}

export function createLayout(input: CreateLayoutInput): Layout {
  return {
    id: input.id,
    floorplanId: input.floorplanId,
    name: input.name,
    createdAt: input.createdAt,
    placements: resolvePlacements(input.items, input.placements),
  };
}
