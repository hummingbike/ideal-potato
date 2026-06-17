import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { FurnitureBoard } from "../../src/components/FurnitureBoard";
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

function pointerEvent(type: string, props: { clientX: number; clientY: number; pointerId?: number }): Event {
  const event = new Event(type, { bubbles: true });
  Object.assign(event, { pointerId: 1, ...props });
  return event;
}

describe("FurnitureBoard", () => {
  it("renders an item element positioned at its source cell with its icon as background", () => {
    render(<FurnitureBoard grid={grid} items={[desk]} pixelsPerCell={50} />);

    const el = screen.getByTestId("furniture-board").querySelector<HTMLElement>('[data-item-id="desk-1"]');
    expect(el).not.toBeNull();
    expect(el?.style.left).toBe("0px");
    expect(el?.style.top).toBe("0px");
    expect(el?.style.backgroundImage).toBe('url("/icons/desk.svg")');
    expect(el?.title).toBe("책상");
  });

  it("positions an item at its layout placement instead of its source cell when given one", () => {
    render(
      <FurnitureBoard
        grid={grid}
        items={[desk]}
        placements={[{ itemId: "desk-1", row: 2, col: 1 }]}
        pixelsPerCell={50}
      />,
    );

    const el = screen.getByTestId("furniture-board").querySelector<HTMLElement>('[data-item-id="desk-1"]');
    expect(el?.style.left).toBe("50px");
    expect(el?.style.top).toBe("100px");
  });

  it("calls onItemMove with the new placement after a drag", () => {
    const onItemMove = vi.fn();
    render(<FurnitureBoard grid={grid} items={[desk]} pixelsPerCell={50} onItemMove={onItemMove} />);

    const el = screen.getByTestId("furniture-board").querySelector<HTMLElement>('[data-item-id="desk-1"]')!;
    el.dispatchEvent(pointerEvent("pointerdown", { clientX: 10, clientY: 10 }));
    el.dispatchEvent(pointerEvent("pointermove", { clientX: 110, clientY: 60 }));
    el.dispatchEvent(pointerEvent("pointerup", { clientX: 110, clientY: 60 }));

    expect(onItemMove).toHaveBeenCalledWith({ itemId: "desk-1", row: 1, col: 2 });
  });
});
