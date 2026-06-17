# @ideal-potato/grid-canvas

Framework-agnostic grid board: render items as DOM elements on a grid, drag
them around with Pointer Events, snap to the nearest cell, and reject moves
that overlap another item. No dependency on React/Vue/this app — usable in
any project that has a DOM.

## Install

This package lives in this monorepo (`packages/grid-canvas`) and isn't
published yet. Within the workspace:

```ts
import { GridBoard } from "@ideal-potato/grid-canvas";
```

## Usage

```ts
import { GridBoard } from "@ideal-potato/grid-canvas";

const board = new GridBoard({
  container: document.querySelector("#board")!,
  grid: { rows: 10, cols: 10, cellSize: 48 },
  items: [{ id: "desk", row: 0, col: 0, w: 2, h: 1 }],
});

board.on("itemmove", ({ id, row, col }) => {
  console.log(`${id} moved to (${row}, ${col})`);
});

board.on("collision", ({ id, row, col }) => {
  console.log(`${id} can't move to (${row}, ${col}), it's occupied`);
});

board.addItem({ id: "bed", row: 3, col: 3, w: 2, h: 2 });
board.moveItem("desk", 1, 1); // returns false and is a no-op if it collides
board.removeItem("bed");
```

## API

- `new GridBoard({ container, grid, items? })` — mounts the board into `container`, sizing it to `grid.cols * grid.cellSize` × `grid.rows * grid.cellSize`.
- `addItem(item)` / `removeItem(id)` — add or remove an item; returns the created element from `addItem`.
- `moveItem(id, row, col)` — moves an item if the target doesn't overlap another item. Returns `true`/`false`.
- `getItem(id)` / `getItems()` / `getElement(id)` — read current state.
- `on(event, listener)` — subscribe to `"itemmove"` or `"collision"`. Returns an unsubscribe function.
- `destroy()` — removes all items and their elements.

Pure grid math (`cellToPixel`, `pixelToCell`, `clampToGrid`, `snapToGrid`,
`hasCollision`, `findCollisions`) is also exported individually for use
outside of `GridBoard`.

## Development

```sh
pnpm --filter @ideal-potato/grid-canvas test    # vitest (jsdom)
pnpm --filter @ideal-potato/grid-canvas build   # tsup -> dist/
pnpm --filter @ideal-potato/grid-canvas dev     # vite dev server for demo/
```
