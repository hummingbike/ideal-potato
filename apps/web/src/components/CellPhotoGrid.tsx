"use client";

import { useState } from "react";
import { cellKey } from "../domain/cell";
import type { Grid } from "../domain/types";
import type { ObjectStoragePort } from "../ports/objectStorage";

export interface CellPhoto {
  row: number;
  col: number;
  url: string;
}

export interface CellPhotoGridProps {
  grid: Grid;
  storage: ObjectStoragePort;
  onCellPhotoUploaded?: (photo: CellPhoto) => void;
}

export function CellPhotoGrid({ grid, storage, onCellPhotoUploaded }: CellPhotoGridProps) {
  const [photos, setPhotos] = useState<Record<string, string>>({});

  async function handleFileChange(row: number, col: number, file: File | undefined) {
    if (!file) return;
    const key = `cells/${grid.floorplanId}/${cellKey(row, col)}-${file.name}`;
    const { url } = await storage.upload(key, file);
    setPhotos((prev) => ({ ...prev, [cellKey(row, col)]: url }));
    onCellPhotoUploaded?.({ row, col, url });
  }

  const rows = Array.from({ length: grid.rows }, (_, row) => row);
  const cols = Array.from({ length: grid.cols }, (_, col) => col);

  return (
    <div
      role="grid"
      aria-label="셀 사진 업로드 그리드"
      className="inline-grid gap-1"
      style={{ gridTemplateColumns: `repeat(${grid.cols}, minmax(0, 1fr))` }}
    >
      {rows.map((row) =>
        cols.map((col) => {
          const url = photos[cellKey(row, col)];
          return (
            <label
              key={cellKey(row, col)}
              className="flex h-12 w-12 items-center justify-center border text-xs text-gray-500"
            >
              {url ? (
                <img src={url} alt={`셀 (${row}, ${col}) 사진`} className="h-full w-full object-cover" />
              ) : (
                <span>{`(${row},${col})`}</span>
              )}
              <input
                type="file"
                accept="image/*"
                aria-label={`셀 (${row}, ${col}) 사진 업로드`}
                className="sr-only"
                onChange={(event) => handleFileChange(row, col, event.target.files?.[0])}
              />
            </label>
          );
        }),
      )}
    </div>
  );
}
