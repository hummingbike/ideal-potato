import { recommendPlacements, type RecommendationResult } from "../domain/recommendation";
import type { FurnitureItem, Grid } from "../domain/types";

export type { RecommendationReason, RecommendationResult } from "../domain/recommendation";

/**
 * Abstraction over whatever generates a recommended layout. PRD.md 9절 /
 * PLAN.md Phase 4 call for a v1 rule-based heuristic now and a Claude
 * API-backed v2 later — callers depend on this interface so the v2 swap
 * doesn't touch them, the same seam used for SegmentationPort.
 */
export interface RecommendationPort {
  recommend(grid: Grid, items: FurnitureItem[]): Promise<RecommendationResult>;
}

/** v1: wraps the local rule-based heuristic (src/domain/recommendation.ts). */
export class HeuristicRecommendationProvider implements RecommendationPort {
  async recommend(grid: Grid, items: FurnitureItem[]): Promise<RecommendationResult> {
    return recommendPlacements(grid, items);
  }
}
