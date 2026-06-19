"use client";

import { useState } from "react";
import { BoundingBoxCorrectionPanel } from "../src/components/BoundingBoxCorrectionPanel";
import { CellPhotoGrid, type CellPhoto } from "../src/components/CellPhotoGrid";
import { DimensionForm } from "../src/components/DimensionForm";
import { FurnitureBoard } from "../src/components/FurnitureBoard";
import { FurnitureExtractionPanel } from "../src/components/FurnitureExtractionPanel";
import { GridSizeForm } from "../src/components/GridSizeForm";
import { LayoutManager } from "../src/components/LayoutManager";
import { RecommendationPanel } from "../src/components/RecommendationPanel";
import type { FurnitureItem, Grid, Layout, LayoutPlacement, Outline } from "../src/domain/types";
import { getSupabaseClient } from "../src/lib/supabaseClient";
import { InMemoryLayoutRepository, SupabaseLayoutRepository, type LayoutRepositoryPort } from "../src/ports/layoutRepository";
import { InMemoryObjectStorage, SupabaseObjectStorage, type ObjectStoragePort } from "../src/ports/objectStorage";
import { HeuristicRecommendationProvider } from "../src/ports/recommendation";
import { StubSegmentationProvider } from "../src/ports/segmentation";

const FLOORPLAN_ID = "floorplan-1";

/** Uses the real Supabase adapters when a project is configured, otherwise the in-memory stand-ins (local dev/tests). */
function createObjectStorage(): ObjectStoragePort {
  const client = getSupabaseClient();
  return client ? new SupabaseObjectStorage(client) : new InMemoryObjectStorage();
}

function createLayoutRepository(): LayoutRepositoryPort {
  const client = getSupabaseClient();
  return client ? new SupabaseLayoutRepository(client) : new InMemoryLayoutRepository();
}

/**
 * Pixel space the StubSegmentationProvider's detected boxes live in. Stands
 * in until real segmentation integration reports each photo's actual
 * dimensions (Phase 3 외부 서비스 연동).
 */
const ASSUMED_IMAGE_BOUNDS = { width: 200, height: 200 };

type Step = "outline" | "grid" | "cells" | "furniture" | "board";

export default function HomePage() {
  const [storage] = useState(createObjectStorage);
  const [segmenter] = useState(() => new StubSegmentationProvider());
  const [repository] = useState(createLayoutRepository);
  const [recommender] = useState(() => new HeuristicRecommendationProvider());

  const [step, setStep] = useState<Step>("outline");
  const [outline, setOutline] = useState<Outline | null>(null);
  const [grid, setGrid] = useState<Grid | null>(null);
  const [cellPhotos, setCellPhotos] = useState<CellPhoto[]>([]);
  const [items, setItems] = useState<FurnitureItem[]>([]);
  const [placements, setPlacements] = useState<LayoutPlacement[]>([]);
  const [placementsBeforeRecommendation, setPlacementsBeforeRecommendation] = useState<LayoutPlacement[] | null>(
    null,
  );

  function handleOutlineSubmit(nextOutline: Outline) {
    setOutline(nextOutline);
    setStep("grid");
  }

  function handleGridSubmit(nextGrid: Grid) {
    setGrid(nextGrid);
    setStep("cells");
  }

  function handleCellPhotoUploaded(photo: CellPhoto) {
    setCellPhotos((prev) => [...prev.filter((p) => !(p.row === photo.row && p.col === photo.col)), photo]);
  }

  function handleFurnitureExtracted(item: FurnitureItem) {
    setItems((prev) => [...prev.filter((existing) => existing.id !== item.id), item]);
  }

  function handleItemUpdate(updated: FurnitureItem) {
    setItems((prev) => prev.map((item) => (item.id === updated.id ? updated : item)));
  }

  function handleItemMove(placement: LayoutPlacement) {
    setPlacements((prev) => [...prev.filter((p) => p.itemId !== placement.itemId), placement]);
  }

  function handleLoadLayout(layout: Layout) {
    setPlacements(layout.placements);
    setPlacementsBeforeRecommendation(null);
  }

  function handleApplyRecommendation(recommended: LayoutPlacement[]) {
    setPlacementsBeforeRecommendation(placements);
    setPlacements(recommended);
  }

  function handleUndoRecommendation() {
    if (!placementsBeforeRecommendation) return;
    setPlacements(placementsBeforeRecommendation);
    setPlacementsBeforeRecommendation(null);
  }

  return (
    <main className="mx-auto flex max-w-3xl flex-col gap-6 p-8">
      <h1 className="text-2xl font-bold">나혼자만 인테리어</h1>

      {step === "outline" && (
        <section>
          <h2 className="mb-2 text-lg font-semibold">1. 방 치수 입력</h2>
          <DimensionForm onSubmit={handleOutlineSubmit} />
        </section>
      )}

      {step === "grid" && outline && (
        <section>
          <h2 className="mb-2 text-lg font-semibold">2. 그리드 생성</h2>
          <GridSizeForm floorplanId={FLOORPLAN_ID} outline={outline} onSubmit={handleGridSubmit} />
        </section>
      )}

      {step === "cells" && grid && (
        <section>
          <h2 className="mb-2 text-lg font-semibold">3. 셀 사진 등록</h2>
          <CellPhotoGrid grid={grid} storage={storage} onCellPhotoUploaded={handleCellPhotoUploaded} />
          <button type="button" className="mt-3" disabled={cellPhotos.length === 0} onClick={() => setStep("furniture")}>
            다음
          </button>
        </section>
      )}

      {step === "furniture" && (
        <section>
          <h2 className="mb-2 text-lg font-semibold">4. 가구 추출</h2>
          <FurnitureExtractionPanel cellPhotos={cellPhotos} segmenter={segmenter} onExtracted={handleFurnitureExtracted} />
          {items.length > 0 && (
            <div className="mt-4 flex flex-col gap-4">
              <h3 className="font-semibold">추출 결과 보정</h3>
              {items.map((item) => (
                <div key={item.id} className="flex flex-col gap-2">
                  <p>{`${item.name} (${item.category})`}</p>
                  {item.boundingBox && (
                    <BoundingBoxCorrectionPanel
                      imageUrl={item.originalImageUrl}
                      boundingBox={item.boundingBox}
                      imageBounds={ASSUMED_IMAGE_BOUNDS}
                      onChange={(box) => handleItemUpdate({ ...item, boundingBox: box })}
                    />
                  )}
                </div>
              ))}
            </div>
          )}
          <button type="button" className="mt-3" disabled={items.length === 0} onClick={() => setStep("board")}>
            보드로 이동
          </button>
        </section>
      )}

      {step === "board" && grid && (
        <section className="flex flex-col gap-4">
          <h2 className="text-lg font-semibold">5. 배치 보드</h2>
          <FurnitureBoard grid={grid} items={items} placements={placements} onItemMove={handleItemMove} />
          <div>
            <h3 className="mb-2 font-semibold">AI 추천 배치</h3>
            <RecommendationPanel grid={grid} items={items} recommender={recommender} onApply={handleApplyRecommendation} />
            {placementsBeforeRecommendation && (
              <button type="button" className="mt-2" onClick={handleUndoRecommendation}>
                되돌리기
              </button>
            )}
          </div>
          <LayoutManager
            floorplanId={FLOORPLAN_ID}
            items={items}
            placements={placements}
            repository={repository}
            onLoad={handleLoadLayout}
          />
        </section>
      )}
    </main>
  );
}
