"use client";

import { useEffect, useState, type FormEvent } from "react";
import { createLayout } from "../domain/layout";
import type { FurnitureItem, Layout, LayoutPlacement } from "../domain/types";
import type { LayoutRepositoryPort } from "../ports/layoutRepository";

export interface LayoutManagerProps {
  floorplanId: string;
  items: FurnitureItem[];
  placements: LayoutPlacement[];
  repository: LayoutRepositoryPort;
  onLoad: (layout: Layout) => void;
}

export function LayoutManager({ floorplanId, items, placements, repository, onLoad }: LayoutManagerProps) {
  const [name, setName] = useState("");
  const [savedLayouts, setSavedLayouts] = useState<Layout[]>([]);
  const [savedMessage, setSavedMessage] = useState<string | null>(null);

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
          </li>
        ))}
      </ul>
    </div>
  );
}
