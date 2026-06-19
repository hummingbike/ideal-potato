"use client";

import { useState } from "react";
import type { FurnitureItem, Grid, LayoutPlacement } from "../domain/types";
import type { RecommendationPort, RecommendationResult } from "../ports/recommendation";

export interface RecommendationPanelProps {
  grid: Grid;
  items: FurnitureItem[];
  recommender: RecommendationPort;
  onApply: (placements: LayoutPlacement[]) => void;
}

/** Generates a recommended layout, previews the reasoning per item, and lets the user apply it. */
export function RecommendationPanel({ grid, items, recommender, onApply }: RecommendationPanelProps) {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<RecommendationResult | null>(null);
  const [applied, setApplied] = useState(false);

  async function handleRecommend() {
    setLoading(true);
    setApplied(false);
    try {
      const next = await recommender.recommend(grid, items);
      setResult(next);
    } finally {
      setLoading(false);
    }
  }

  function handleApply() {
    if (!result) return;
    onApply(result.placements);
    setApplied(true);
  }

  const itemById = new Map(items.map((item) => [item.id, item]));

  return (
    <div className="flex flex-col gap-3">
      <button type="button" onClick={handleRecommend} disabled={loading || items.length === 0}>
        {loading ? "추천 생성 중..." : "추천 받기"}
      </button>

      {result && (
        <div className="flex flex-col gap-2" data-testid="recommendation-preview">
          <ul className="flex flex-col gap-1">
            {result.reasons.map((reason) => (
              <li key={reason.itemId}>
                {`${itemById.get(reason.itemId)?.name ?? reason.itemId}: ${reason.text}`}
              </li>
            ))}
          </ul>
          {result.unplaced.length > 0 && (
            <p role="alert">
              {`배치하지 못한 가구: ${result.unplaced.map((id) => itemById.get(id)?.name ?? id).join(", ")}`}
            </p>
          )}
          <button type="button" onClick={handleApply}>
            추천 적용
          </button>
          {applied && <p role="status">추천을 적용했습니다.</p>}
        </div>
      )}
    </div>
  );
}
