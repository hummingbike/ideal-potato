import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { LayoutComparisonView } from "../../src/components/LayoutComparisonView";
import type { FurnitureItem, Grid, Layout } from "../../src/domain/types";

const grid: Grid = { floorplanId: "fp-1", rows: 4, cols: 4, cellSizeMeters: 0.5 };

const desk: FurnitureItem = {
  id: "desk-1",
  name: "책상",
  category: "desk",
  size: { w: 1, h: 1 },
  originalImageUrl: "memory://desk.png",
  sourceCell: { row: 0, col: 0 },
};

const before: Layout = {
  id: "layout-before",
  floorplanId: "fp-1",
  name: "기존 배치",
  createdAt: "2026-06-17T00:00:00.000Z",
  placements: [{ itemId: "desk-1", row: 0, col: 0 }],
};

const after: Layout = {
  id: "layout-after",
  floorplanId: "fp-1",
  name: "새 배치",
  createdAt: "2026-06-18T00:00:00.000Z",
  placements: [{ itemId: "desk-1", row: 2, col: 1 }],
};

describe("LayoutComparisonView", () => {
  it("labels each snapshot with its layout name", () => {
    render(<LayoutComparisonView grid={grid} items={[desk]} before={before} after={after} />);

    expect(screen.getByText("이전: 기존 배치")).toBeInTheDocument();
    expect(screen.getByText("이후: 새 배치")).toBeInTheDocument();
  });

  it("renders each snapshot's item at its own layout's placement", () => {
    render(<LayoutComparisonView grid={grid} items={[desk]} before={before} after={after} pixelsPerCell={50} />);

    const snapshots = screen.getAllByTestId("layout-snapshot");
    expect(snapshots).toHaveLength(2);

    const beforeItem = snapshots[0].querySelector<HTMLElement>('[data-item-id="desk-1"]');
    expect(beforeItem?.style.left).toBe("0px");
    expect(beforeItem?.style.top).toBe("0px");

    const afterItem = snapshots[1].querySelector<HTMLElement>('[data-item-id="desk-1"]');
    expect(afterItem?.style.left).toBe("50px");
    expect(afterItem?.style.top).toBe("100px");
  });
});
