import type { BoundingBox } from "../ports/segmentation";

export interface ImageBounds {
  width: number;
  height: number;
}

/** Smallest a corrected box may shrink to, in source-image pixels. */
export const MIN_BOX_SIZE = 8;

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

/** Keeps a box fully inside the image and no smaller than MIN_BOX_SIZE on either side. */
export function clampBoundingBox(box: BoundingBox, bounds: ImageBounds): BoundingBox {
  const width = clamp(box.width, MIN_BOX_SIZE, Math.max(bounds.width, MIN_BOX_SIZE));
  const height = clamp(box.height, MIN_BOX_SIZE, Math.max(bounds.height, MIN_BOX_SIZE));
  const x = clamp(box.x, 0, bounds.width - width);
  const y = clamp(box.y, 0, bounds.height - height);
  return { x, y, width, height };
}

/** Translates a box by (dx, dy) without resizing it, clamped to stay inside the image. */
export function moveBoundingBox(box: BoundingBox, dx: number, dy: number, bounds: ImageBounds): BoundingBox {
  return clampBoundingBox({ ...box, x: box.x + dx, y: box.y + dy }, bounds);
}

/**
 * Resizes a box from its bottom-right corner by (dw, dh). Keeps the box's
 * top-left corner fixed and caps growth at the image's right/bottom edge,
 * rather than clampBoundingBox's behavior of repositioning an oversized box.
 */
export function resizeBoundingBox(box: BoundingBox, dw: number, dh: number, bounds: ImageBounds): BoundingBox {
  const maxWidth = Math.max(bounds.width - box.x, MIN_BOX_SIZE);
  const maxHeight = Math.max(bounds.height - box.y, MIN_BOX_SIZE);
  return {
    x: box.x,
    y: box.y,
    width: clamp(box.width + dw, MIN_BOX_SIZE, maxWidth),
    height: clamp(box.height + dh, MIN_BOX_SIZE, maxHeight),
  };
}
