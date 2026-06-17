import { beforeEach, describe, expect, it } from "vitest";
import { GridBoard } from "../src/GridBoard";
import type { GridConfig, ItemPlacement } from "../src/types";

const grid: GridConfig = { rows: 4, cols: 4, cellSize: 50 };

/**
 * jsdom doesn't implement the PointerEvent constructor, but our handlers
 * only read plain properties (clientX/clientY/pointerId) off the event, so
 * a plain Event with those properties attached works just as well.
 */
function pointerEvent(type: string, props: { clientX: number; clientY: number; pointerId?: number }): Event {
  const event = new Event(type, { bubbles: true });
  Object.assign(event, { pointerId: 1, ...props });
  return event;
}

function drag(
  el: HTMLElement,
  path: { clientX: number; clientY: number }[],
): void {
  const [start, ...rest] = path;
  el.dispatchEvent(pointerEvent("pointerdown", start));
  for (const point of rest) {
    el.dispatchEvent(pointerEvent("pointermove", point));
  }
  el.dispatchEvent(pointerEvent("pointerup", path[path.length - 1]));
}

let container: HTMLElement;

beforeEach(() => {
  container = document.createElement("div");
  document.body.appendChild(container);
});

describe("GridBoard rendering", () => {
  it("sizes the container to the grid dimensions", () => {
    new GridBoard({ container, grid });
    expect(container.style.width).toBe("200px");
    expect(container.style.height).toBe("200px");
  });

  it("renders each item at its cell position and size", () => {
    const item: ItemPlacement = { id: "desk", row: 1, col: 2, w: 2, h: 1 };
    const board = new GridBoard({ container, grid, items: [item] });

    const el = board.getElement("desk")!;
    expect(el.style.left).toBe("100px");
    expect(el.style.top).toBe("50px");
    expect(el.style.width).toBe("100px");
    expect(el.style.height).toBe("50px");
  });
});

describe("GridBoard.moveItem", () => {
  it("moves an item and emits itemmove when the target is free", () => {
    const item: ItemPlacement = { id: "a", row: 0, col: 0, w: 1, h: 1 };
    const board = new GridBoard({ container, grid, items: [item] });
    const moves: unknown[] = [];
    board.on("itemmove", (payload) => moves.push(payload));

    const moved = board.moveItem("a", 2, 3);

    expect(moved).toBe(true);
    expect(board.getItem("a")).toEqual({ id: "a", row: 2, col: 3, w: 1, h: 1 });
    expect(moves).toEqual([{ id: "a", row: 2, col: 3 }]);
  });

  it("rejects a move that overlaps another item and emits collision", () => {
    const a: ItemPlacement = { id: "a", row: 0, col: 0, w: 1, h: 1 };
    const b: ItemPlacement = { id: "b", row: 2, col: 3, w: 1, h: 1 };
    const board = new GridBoard({ container, grid, items: [a, b] });
    const collisions: unknown[] = [];
    board.on("collision", (payload) => collisions.push(payload));

    const moved = board.moveItem("a", 2, 3);

    expect(moved).toBe(false);
    expect(board.getItem("a")).toEqual(a);
    expect(collisions).toEqual([{ id: "a", row: 2, col: 3 }]);
  });

  it("returns false for an unknown item id", () => {
    const board = new GridBoard({ container, grid });
    expect(board.moveItem("missing", 0, 0)).toBe(false);
  });
});

describe("GridBoard drag and drop", () => {
  it("snaps the item to the nearest free cell after a drag", () => {
    const item: ItemPlacement = { id: "a", row: 0, col: 0, w: 1, h: 1 };
    const board = new GridBoard({ container, grid, items: [item] });
    const el = board.getElement("a")!;

    // Grab the item near its top-left corner, then drag it toward (row 2, col 3).
    drag(el, [
      { clientX: 10, clientY: 10 },
      { clientX: 160, clientY: 110 },
    ]);

    expect(board.getItem("a")).toEqual({ id: "a", row: 2, col: 3, w: 1, h: 1 });
    expect(el.style.left).toBe("150px");
    expect(el.style.top).toBe("100px");
  });

  it("reverts to the original position when the drop target collides", () => {
    const a: ItemPlacement = { id: "a", row: 0, col: 0, w: 1, h: 1 };
    const b: ItemPlacement = { id: "b", row: 2, col: 3, w: 1, h: 1 };
    const board = new GridBoard({ container, grid, items: [a, b] });
    const el = board.getElement("a")!;

    drag(el, [
      { clientX: 10, clientY: 10 },
      { clientX: 160, clientY: 110 },
    ]);

    expect(board.getItem("a")).toEqual(a);
    expect(el.style.left).toBe("0px");
    expect(el.style.top).toBe("0px");
  });
});

describe("GridBoard.removeItem / destroy", () => {
  it("removes the item's element and state", () => {
    const item: ItemPlacement = { id: "a", row: 0, col: 0, w: 1, h: 1 };
    const board = new GridBoard({ container, grid, items: [item] });

    board.removeItem("a");

    expect(board.getItem("a")).toBeUndefined();
    expect(container.children.length).toBe(0);
  });

  it("destroy removes every item", () => {
    const board = new GridBoard({
      container,
      grid,
      items: [
        { id: "a", row: 0, col: 0, w: 1, h: 1 },
        { id: "b", row: 1, col: 1, w: 1, h: 1 },
      ],
    });

    board.destroy();

    expect(board.getItems()).toEqual([]);
    expect(container.children.length).toBe(0);
  });
});
