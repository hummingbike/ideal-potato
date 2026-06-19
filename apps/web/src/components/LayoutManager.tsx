"use client";

import { useEffect, useState, type FormEvent } from "react";
import { createLayout } from "../domain/layout";
import type { FurnitureItem, Grid, Layout, LayoutPlacement } from "../domain/types";
import type { LayoutRepositoryPort } from "../ports/layoutRepository";
import { LayoutComparisonView } from "./LayoutComparisonView";

export interface LayoutManagerProps {
  floorplanId: string;
  grid: Grid;
  items: FurnitureItem[];
  placements: LayoutPlacement[];
  repository: LayoutRepositoryPort;
  onLoad: (layout: Layout) => void;
}

const MAX_COMPARE_SELECTION = 2;

export function LayoutManager({ floorplanId, grid, items, placements, repository, onLoad }: LayoutManagerProps) {
  const [name, setName] = useState("");
  const [savedLayouts, setSavedLayouts] = useState<Layout[]>([]);
  const [savedMessage, setSavedMessage] = useState<string | null>(null);
  const [compareSelection, setCompareSelection] = useState<string[]>([]);

  useEffect(() => {
    let cancelled = false;
    repository.listByFloorplan(floorplanId).then((layouts) => {
      if (!cancelled) setSavedLayouts(layouts);
    });
    return () => {
      cancelled = true;
    };
  }, [repository, floorplanId]);

  async function handleSave(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const layout = createLayout({
      id: `layout-${Date.now()}`,
      floorplanId,
      name: name.trim() || "이름 없는 배치",
      items,
      placements,
      createdAt: new Date().toISOString(),
    });

    await repository.save(layout);
    setName("");
    setSavedMessage(`"${layout.name}" 저장됨`);
    setSavedLayouts(await repository.listByFloorplan(floorplanId));
  }

  function toggleCompare(layoutId: string) {
    setCompareSelection((prev) => {
      if (prev.includes(layoutId)) return prev.filter((id) => id !== layoutId);
      if (prev.length >= MAX_COMPARE_SELECTION) return prev;
      return [...prev, layoutId];
    });
  }

  const [beforeId, afterId] = compareSelection;
  const beforeLayout = savedLayouts.find((layout) => layout.id === beforeId);
  const afterLayout = savedLayouts.find((layout) => layout.id === afterId);

  return (
    <div className="flex flex-col gap-3">
      <form onSubmit={handleSave} className="flex items-end gap-2">
        <label className="flex flex-col gap-1">
          <span>배치 이름</span>
          <input type="text" value={name} onChange={(event) => setName(event.target.value)} aria-label="배치 이름" />
        </label>
        <button type="submit">배치 저장</button>
      </form>
      {savedMessage && <p role="status">{savedMessage}</p>}
      <ul className="flex flex-col gap-1">
        {savedLayouts.map((layout) => (
          <li key={layout.id} className="flex items-center gap-2">
            <span>{layout.name}</span>
            <button type="button" onClick={() => onLoad(layout)}>
              불러오기
            </button>
            <label className="flex items-center gap-1">
              <input
                type="checkbox"
                aria-label={`${layout.name} 비교용 선택`}
                checked={compareSelection.includes(layout.id)}
                disabled={!compareSelection.includes(layout.id) && compareSelection.length >= MAX_COMPARE_SELECTION}
                onChange={() => toggleCompare(layout.id)}
              />
              비교
            </label>
          </li>
        ))}
      </ul>
      {beforeLayout && afterLayout && (
        <div className="flex flex-col gap-2">
          <LayoutComparisonView grid={grid} items={items} before={beforeLayout} after={afterLayout} />
          <button type="button" onClick={() => setCompareSelection([])}>
            비교 닫기
          </button>
        </div>
      )}
    </div>
  );
}
