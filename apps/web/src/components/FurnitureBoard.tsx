"use client";

import { GridBoard } from "@ideal-potato/grid-canvas";
import { useEffect, useRef } from "react";
import type { FurnitureItem, Grid, LayoutPlacement } from "../domain/types";

export interface FurnitureBoardProps {
  grid: Grid;
  items: FurnitureItem[];
  placements?: LayoutPlacement[];
  /** Pixel size of one grid cell on screen. */
  pixelsPerCell?: number;
  onItemMove?: (placement: LayoutPlacement) => void;
  onCollision?: (attempt: LayoutPlacement) => void;
}

/** Renders furniture items on a @ideal-potato/grid-canvas board, using each item's 2D top-view icon. */
export function FurnitureBoard({
  grid,
  items,
  placements = [],
  pixelsPerCell = 48,
  onItemMove,
  onCollision,
}: FurnitureBoardProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const placementByItemId = new Map(placements.map((placement) => [placement.itemId, placement]));

    const board = new GridBoard({
      container,
      grid: { rows: grid.rows, cols: grid.cols, cellSize: pixelsPerCell },
      items: items.map((item) => {
        const placement = placementByItemId.get(item.id);
        return {
          id: item.id,
          row: placement?.row ?? item.sourceCell.row,
          col: placement?.col ?? item.sourceCell.col,
          w: item.size.w,
          h: item.size.h,
        };
      }),
    });

    for (const item of items) {
      const el = board.getElement(item.id);
      if (el && item.iconImageUrl) {
        el.style.backgroundImage = `url(${item.iconImageUrl})`;
        el.style.backgroundSize = "contain";
        el.style.backgroundRepeat = "no-repeat";
        el.style.backgroundPosition = "center";
        el.title = item.name;
      }
    }

    const unsubscribeMove = board.on("itemmove", ({ id, row, col }) => {
      onItemMove?.({ itemId: id, row, col });
    });
    const unsubscribeCollision = board.on("collision", ({ id, row, col }) => {
      onCollision?.({ itemId: id, row, col });
    });

    return () => {
      unsubscribeMove();
      unsubscribeCollision();
      board.destroy();
    };
  }, [grid.rows, grid.cols, pixelsPerCell, items, placements, onItemMove, onCollision]);

  return <div ref={containerRef} data-testid="furniture-board" />;
}
