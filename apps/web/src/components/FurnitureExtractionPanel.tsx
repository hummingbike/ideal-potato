"use client";

import { useState } from "react";
import { cellKey } from "../domain/cell";
import { extractFurniture } from "../domain/furnitureExtraction";
import { applyTopViewIcon, FURNITURE_CATEGORIES } from "../domain/furnitureIcon";
import { validateFurnitureMetadata, type FurnitureMetadataInput } from "../domain/furnitureMetadata";
import type { FurnitureItem } from "../domain/types";
import type { SegmentationPort } from "../ports/segmentation";
import type { CellPhoto } from "./CellPhotoGrid";

export interface FurnitureExtractionPanelProps {
  cellPhotos: CellPhoto[];
  segmenter: SegmentationPort;
  onExtracted: (item: FurnitureItem) => void;
}

function defaultMetadata(photo: CellPhoto): FurnitureMetadataInput {
  return { name: `가구 (${photo.row}, ${photo.col})`, category: "기타", size: { w: 1, h: 1 } };
}

export function FurnitureExtractionPanel({ cellPhotos, segmenter, onExtracted }: FurnitureExtractionPanelProps) {
  const [extractingKey, setExtractingKey] = useState<string | null>(null);
  const [extractedKeys, setExtractedKeys] = useState<Set<string>>(new Set());
  const [metadataByKey, setMetadataByKey] = useState<Record<string, FurnitureMetadataInput>>({});

  function getMetadata(photo: CellPhoto): FurnitureMetadataInput {
    return metadataByKey[cellKey(photo.row, photo.col)] ?? defaultMetadata(photo);
  }

  function updateMetadata(photo: CellPhoto, patch: Partial<FurnitureMetadataInput>) {
    const key = cellKey(photo.row, photo.col);
    setMetadataByKey((prev) => ({ ...prev, [key]: { ...getMetadata(photo), ...patch } }));
  }

  async function handleExtract(photo: CellPhoto) {
    const key = cellKey(photo.row, photo.col);
    const result = validateFurnitureMetadata(getMetadata(photo));
    if (!result.ok) return;

    setExtractingKey(key);
    try {
      const item = await extractFurniture(segmenter, {
        id: `furniture-${key}`,
        name: result.metadata.name,
        category: result.metadata.category,
        imageUrl: photo.url,
        sourceCell: { row: photo.row, col: photo.col },
        size: result.metadata.size,
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
    <ul className="flex flex-col gap-3">
      {cellPhotos.map((photo) => {
        const key = cellKey(photo.row, photo.col);
        const isExtracting = extractingKey === key;
        const isExtracted = extractedKeys.has(key);
        const metadata = getMetadata(photo);
        const validation = validateFurnitureMetadata(metadata);

        return (
          <li key={key} className="flex flex-col gap-2 border-b pb-2">
            <span>{`(${photo.row}, ${photo.col})`}</span>
            <label htmlFor={`furniture-name-${key}`}>이름</label>
            <input
              id={`furniture-name-${key}`}
              type="text"
              value={metadata.name}
              onChange={(event) => updateMetadata(photo, { name: event.target.value })}
            />
            <label htmlFor={`furniture-category-${key}`}>카테고리</label>
            <select
              id={`furniture-category-${key}`}
              value={metadata.category}
              onChange={(event) => updateMetadata(photo, { category: event.target.value })}
            >
              {FURNITURE_CATEGORIES.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
            <label htmlFor={`furniture-width-${key}`}>가로 칸 수</label>
            <input
              id={`furniture-width-${key}`}
              type="number"
              value={metadata.size.w}
              onChange={(event) => updateMetadata(photo, { size: { ...metadata.size, w: Number(event.target.value) } })}
            />
            <label htmlFor={`furniture-height-${key}`}>세로 칸 수</label>
            <input
              id={`furniture-height-${key}`}
              type="number"
              value={metadata.size.h}
              onChange={(event) => updateMetadata(photo, { size: { ...metadata.size, h: Number(event.target.value) } })}
            />
            {!validation.ok && (
              <ul role="alert">
                {validation.errors.map((error) => (
                  <li key={error}>{error}</li>
                ))}
              </ul>
            )}
            <button type="button" onClick={() => handleExtract(photo)} disabled={isExtracting || !validation.ok}>
              {isExtracting ? "추출 중..." : "가구 추출"}
            </button>
            {isExtracted && <span role="status">추출 완료</span>}
          </li>
        );
      })}
    </ul>
  );
}
