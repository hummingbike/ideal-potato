import { describe, expect, it } from "vitest";
import { applyTopViewIcon, getIconForCategory } from "../../src/domain/furnitureIcon";
import type { FurnitureItem } from "../../src/domain/types";

describe("getIconForCategory", () => {
  it("returns the matching icon for a known category", () => {
    expect(getIconForCategory("desk")).toBe("/icons/desk.svg");
    expect(getIconForCategory("bed")).toBe("/icons/bed.svg");
  });

  it("falls back to the generic icon for an unknown category", () => {
    expect(getIconForCategory("spaceship")).toBe("/icons/generic.svg");
  });
});

describe("applyTopViewIcon", () => {
  it("sets iconImageUrl based on category without changing other fields", () => {
    const item: FurnitureItem = {
      id: "desk-1",
      name: "책상",
      category: "desk",
      size: { w: 2, h: 1 },
      originalImageUrl: "memory://a.png",
      segmentedImageUrl: "memory://a-cropped.png",
      sourceCell: { row: 0, col: 0 },
    };

    expect(applyTopViewIcon(item)).toEqual({ ...item, iconImageUrl: "/icons/desk.svg" });
  });
});
