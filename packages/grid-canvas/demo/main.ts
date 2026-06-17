import { GridBoard } from "../src/index";

const board = new GridBoard({
  container: document.querySelector<HTMLDivElement>("#board")!,
  grid: { rows: 8, cols: 10, cellSize: 48 },
  items: [
    { id: "desk", row: 0, col: 0, w: 2, h: 1 },
    { id: "bed", row: 3, col: 6, w: 3, h: 2 },
    { id: "chair", row: 0, col: 4, w: 1, h: 1 },
  ],
});

const colors: Record<string, string> = {
  desk: "#3b82f6",
  bed: "#ef4444",
  chair: "#10b981",
};

for (const item of board.getItems()) {
  const el = board.getElement(item.id);
  if (el) {
    el.style.background = colors[item.id] ?? "#888";
    el.textContent = item.id;
  }
}

const log = document.querySelector<HTMLDivElement>("#log")!;
function appendLog(line: string): void {
  log.textContent = `${line}\n${log.textContent}`;
}

board.on("itemmove", ({ id, row, col }) => {
  appendLog(`moved ${id} -> (${row}, ${col})`);
});

board.on("collision", ({ id, row, col }) => {
  appendLog(`blocked ${id} -> (${row}, ${col}), occupied`);
});
