"use client";

import { useState, type FormEvent } from "react";
import { createGrid } from "../domain/grid";
import type { Grid, Outline } from "../domain/types";

export interface GridSizeFormProps {
  floorplanId: string;
  outline: Outline;
  onSubmit: (grid: Grid) => void;
}

export function GridSizeForm({ floorplanId, outline, onSubmit }: GridSizeFormProps) {
  const [cellSize, setCellSize] = useState("0.5");
  const [errors, setErrors] = useState<string[]>([]);

  const parsedCellSize = Number.parseFloat(cellSize);
  const preview =
    Number.isFinite(parsedCellSize) && parsedCellSize > 0
      ? {
          rows: Math.ceil(outline.heightMeters / parsedCellSize),
          cols: Math.ceil(outline.widthMeters / parsedCellSize),
        }
      : null;

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const result = createGrid(floorplanId, outline, parsedCellSize);

    if (!result.ok) {
      setErrors(result.errors);
      return;
    }

    setErrors([]);
    onSubmit(result.grid);
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3">
      <label className="flex flex-col gap-1">
        <span>셀 크기 (m)</span>
        <input
          type="number"
          step="0.1"
          value={cellSize}
          onChange={(event) => setCellSize(event.target.value)}
          aria-label="셀 크기(미터)"
        />
      </label>
      {preview && <p data-testid="grid-preview">{`${preview.rows} x ${preview.cols} 그리드가 생성됩니다.`}</p>}
      {errors.length > 0 && (
        <ul role="alert" className="text-sm text-red-600">
          {errors.map((error) => (
            <li key={error}>{error}</li>
          ))}
        </ul>
      )}
      <button type="submit">그리드 생성</button>
    </form>
  );
}
