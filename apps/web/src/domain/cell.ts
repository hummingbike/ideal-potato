/** Stable map key for a cell position, used to index per-cell photos/state. */
export function cellKey(row: number, col: number): string {
  return `${row}-${col}`;
}
