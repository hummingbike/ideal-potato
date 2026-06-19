import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { LayoutSnapshot } from "../../src/components/LayoutSnapshot";
import type { FurnitureItem, Grid } from "../../src/domain/types";

const grid: Grid = { floorplanId: "fp-1", rows: 4, cols: 4, cellSizeMeters: 0.5 };

const desk: FurnitureItem = {
  id: "desk-1",
  name: "책상",
  category: "desk",
  size: { w: 1, h: 1 },
  originalImageUrl: "memory://desk.png",
  iconImageUrl: "/icons/desk.svg",
  sourceCell: { row: 0, col: 0 },
};

describe("LayoutSnapshot", () => {
  it("renders the given label", () => {
    render(<LayoutSnapshot grid={grid} items={[desk]} placements={[]} label="이전 배치" />);
    expect(screen.getByText("이전 배치")).toBeInTheDocument();
  });

  it("positions an item at its given placement, falling back to its source cell", () => {
    render(
      <LayoutSnapshot
        grid={grid}
        items={[desk]}
        placements={[{ itemId: "desk-1", row: 2, col: 1 }]}
        pixelsPerCell={50}
        label="이후 배치"
      />,
    );

    const el = screen.getByTestId("layout-snapshot").querySelector<HTMLElement>('[data-item-id="desk-1"]');
    expect(el?.style.left).toBe("50px");
    expect(el?.style.top).toBe("100px");
    expect(el?.style.backgroundImage).toBe('url("/icons/desk.svg")');
    expect(el?.title).toBe("책상");
  });

  it("falls back to the item's source cell when no placement is given for it", () => {
    render(<LayoutSnapshot grid={grid} items={[desk]} placements={[]} pixelsPerCell={50} label="기본" />);

    const el = screen.getByTestId("layout-snapshot").querySelector<HTMLElement>('[data-item-id="desk-1"]');
    expect(el?.style.left).toBe("0px");
    expect(el?.style.top).toBe("0px");
  });
});
