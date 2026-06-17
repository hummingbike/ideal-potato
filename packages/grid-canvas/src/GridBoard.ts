import { hasCollision } from "./collision";
import { cellToPixel } from "./coordinates";
import { EventEmitter } from "./EventEmitter";
import { snapToGrid } from "./snap";
import type { GridConfig, ItemPlacement, PixelPosition } from "./types";

export interface GridBoardEvents {
  itemmove: { id: string; row: number; col: number };
  collision: { id: string; row: number; col: number };
}

export interface GridBoardOptions {
  container: HTMLElement;
  grid: GridConfig;
  items?: ItemPlacement[];
}

interface DragState {
  id: string;
  pointerId: number;
  /** Pointer position within the container, relative to the item's top-left corner, at drag start. */
  offset: PixelPosition;
}

/**
 * Framework-agnostic grid board: renders items as absolutely positioned DOM
 * elements inside a container and lets the user drag them around, snapping
 * to the grid and rejecting moves that would overlap another item.
 */
export class GridBoard extends EventEmitter<GridBoardEvents> {
  readonly grid: GridConfig;
  private readonly container: HTMLElement;
  private readonly items = new Map<string, ItemPlacement>();
  private readonly elements = new Map<string, HTMLElement>();
  private dragState: DragState | null = null;

  constructor(options: GridBoardOptions) {
    super();
    this.grid = options.grid;
    this.container = options.container;
    this.container.style.position = "relative";
    this.container.style.width = `${this.grid.cols * this.grid.cellSize}px`;
    this.container.style.height = `${this.grid.rows * this.grid.cellSize}px`;

    for (const item of options.items ?? []) {
      this.addItem(item);
    }
  }

  getItems(): ItemPlacement[] {
    return Array.from(this.items.values());
  }

  getItem(id: string): ItemPlacement | undefined {
    return this.items.get(id);
  }

  getElement(id: string): HTMLElement | undefined {
    return this.elements.get(id);
  }

  addItem(item: ItemPlacement): HTMLElement {
    this.items.set(item.id, item);

    const el = document.createElement("div");
    el.dataset.itemId = item.id;
    el.style.position = "absolute";
    el.style.boxSizing = "border-box";
    el.style.touchAction = "none";
    this.applyElementGeometry(el, item);
    el.addEventListener("pointerdown", (event) => this.handlePointerDown(item.id, event));

    this.container.appendChild(el);
    this.elements.set(item.id, el);
    return el;
  }

  removeItem(id: string): void {
    this.elements.get(id)?.remove();
    this.elements.delete(id);
    this.items.delete(id);
  }

  /**
   * Attempts to move an item to a cell position. Returns false (and leaves
   * the item untouched) if the id is unknown or the target overlaps another
   * item.
   */
  moveItem(id: string, row: number, col: number): boolean {
    const item = this.items.get(id);
    if (!item) return false;

    const candidate = { id, row, col, w: item.w, h: item.h };
    if (hasCollision(this.getItems(), candidate)) {
      this.emit("collision", { id, row, col });
      return false;
    }

    const moved: ItemPlacement = { ...item, row, col };
    this.items.set(id, moved);
    const el = this.elements.get(id);
    if (el) this.applyElementGeometry(el, moved);
    this.emit("itemmove", { id, row, col });
    return true;
  }

  destroy(): void {
    for (const id of Array.from(this.elements.keys())) {
      this.removeItem(id);
    }
  }

  private applyElementGeometry(el: HTMLElement, item: ItemPlacement): void {
    const { x, y } = cellToPixel(this.grid, item);
    el.style.left = `${x}px`;
    el.style.top = `${y}px`;
    el.style.width = `${item.w * this.grid.cellSize}px`;
    el.style.height = `${item.h * this.grid.cellSize}px`;
  }

  private pointerToContainer(event: PointerEvent): PixelPosition {
    const rect = this.container.getBoundingClientRect();
    return { x: event.clientX - rect.left, y: event.clientY - rect.top };
  }

  private handlePointerDown(id: string, event: PointerEvent): void {
    const el = this.elements.get(id);
    const item = this.items.get(id);
    if (!el || !item) return;

    const itemPixel = cellToPixel(this.grid, item);
    const pointer = this.pointerToContainer(event);

    this.dragState = {
      id,
      pointerId: event.pointerId,
      offset: { x: pointer.x - itemPixel.x, y: pointer.y - itemPixel.y },
    };

    el.setPointerCapture?.(event.pointerId);

    const handleMove = (moveEvent: PointerEvent) => this.handlePointerMove(moveEvent);
    const handleUp = (upEvent: PointerEvent) => {
      this.handlePointerUp(upEvent);
      el.removeEventListener("pointermove", handleMove);
      el.removeEventListener("pointerup", handleUp);
      el.removeEventListener("pointercancel", handleUp);
    };
    el.addEventListener("pointermove", handleMove);
    el.addEventListener("pointerup", handleUp);
    el.addEventListener("pointercancel", handleUp);
  }

  private handlePointerMove(event: PointerEvent): void {
    if (!this.dragState || event.pointerId !== this.dragState.pointerId) return;
    const el = this.elements.get(this.dragState.id);
    if (!el) return;

    const pointer = this.pointerToContainer(event);
    const free: PixelPosition = {
      x: pointer.x - this.dragState.offset.x,
      y: pointer.y - this.dragState.offset.y,
    };

    // Live preview while dragging; the authoritative, collision-checked
    // placement happens on pointer up.
    el.style.left = `${free.x}px`;
    el.style.top = `${free.y}px`;
  }

  private handlePointerUp(event: PointerEvent): void {
    if (!this.dragState || event.pointerId !== this.dragState.pointerId) return;
    const { id } = this.dragState;
    this.dragState = null;

    const item = this.items.get(id);
    const el = this.elements.get(id);
    if (!item || !el) return;

    const free: PixelPosition = {
      x: Number.parseFloat(el.style.left) || 0,
      y: Number.parseFloat(el.style.top) || 0,
    };

    const target = snapToGrid(this.grid, free, item);
    const moved = this.moveItem(id, target.row, target.col);
    if (!moved) {
      this.applyElementGeometry(el, item);
    }
  }
}
