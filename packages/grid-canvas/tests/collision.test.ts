import { describe, expect, it } from "vitest";
import { findCollisions, hasCollision } from "../src/collision";
import type { ItemPlacement } from "../src/types";

const desk: ItemPlacement = { id: "desk", row: 0, col: 0, w: 2, h: 2 };
const bed: ItemPlacement = { id: "bed", row: 4, col: 4, w: 2, h: 3 };
const items: ItemPlacement[] = [desk, bed];

describe("hasCollision", () => {
  it("detects overlap with another item", () => {
    expect(hasCollision(items, { id: "new", row: 1, col: 1, w: 1, h: 1 })).toBe(true);
  });

  it("returns false when the candidate only touches edges without overlapping", () => {
    expect(hasCollision(items, { id: "new", row: 0, col: 2, w: 2, h: 2 })).toBe(false);
  });

  it("returns false for an empty area", () => {
    expect(hasCollision(items, { id: "new", row: 8, col: 0, w: 1, h: 1 })).toBe(false);
  });

  it("ignores the item's own current placement when moving it", () => {
    expect(hasCollision(items, { id: "desk", row: 0, col: 0, w: 2, h: 2 })).toBe(false);
  });
});

describe("findCollisions", () => {
  it("returns every overlapping item", () => {
    expect(findCollisions(items, { id: "new", row: 0, col: 0, w: 6, h: 6 })).toEqual([desk, bed]);
  });

  it("returns an empty array when nothing overlaps", () => {
    expect(findCollisions(items, { id: "new", row: 8, col: 8, w: 1, h: 1 })).toEqual([]);
  });
});
