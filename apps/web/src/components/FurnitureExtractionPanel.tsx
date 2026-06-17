"use client";

import { useState } from "react";
import { cellKey } from "../domain/cell";
import { extractFurniture } from "../domain/furnitureExtraction";
import { applyTopViewIcon } from "../domain/furnitureIcon";
import type { FurnitureItem } from "../domain/types";
import type { SegmentationPort } from "../ports/segmentation";
import type { CellPhoto } from "./CellPhotoGrid";

export interface FurnitureExtractionPanelProps {
  cellPhotos: CellPhoto[];
  segmenter: SegmentationPort;
  onExtracted: (item: FurnitureItem) => void;
}

/** Default footprint for newly extracted furniture; the user can resize it later on the board. */
const DEFAULT_SIZE = { w: 1, h: 1 };

export function FurnitureExtractionPanel({ cellPhotos, segmenter, onExtracted }: FurnitureExtractionPanelProps) {
  const [extractingKey, setExtractingKey] = useState<string | null>(null);
  const [extractedKeys, setExtractedKeys] = useState<Set<string>>(new Set());

  async function handleExtract(photo: CellPhoto) {
    const key = cellKey(photo.row, photo.col);
    setExtractingKey(key);
    try {
      const item = await extractFurniture(segmenter, {
        id: `furniture-${key}`,
        name: `가구 (${photo.row}, ${photo.col})`,
        category: "기타",
        imageUrl: photo.url,
        sourceCell: { row: photo.row, col: photo.col },
        size: DEFAULT_SIZE,
      });
      setExtractedKeys((prev) => new Set(prev).add(key));
      onExtracted(applyTopViewIcon(item));
    } finally {
      setExtractingKey(null);
    }
  }

  if (cellPhotos.length === 0) {
    return <p>먼저 셀에 사진을 등록해주세요.</p>;
  }

  return (
    <ul className="flex flex-col gap-2">
      {cellPhotos.map((photo) => {
        const key = cellKey(photo.row, photo.col);
        const isExtracting = extractingKey === key;
        const isExtracted = extractedKeys.has(key);
        return (
          <li key={key} className="flex items-center gap-2">
            <span>{`(${photo.row}, ${photo.col})`}</span>
            <button type="button" onClick={() => handleExtract(photo)} disabled={isExtracting}>
              {isExtracting ? "추출 중..." : "가구 추출"}
            </button>
            {isExtracted && <span role="status">추출 완료</span>}
          </li>
        );
      })}
    </ul>
  );
}
