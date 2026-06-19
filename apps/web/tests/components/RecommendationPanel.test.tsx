import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { RecommendationPanel } from "../../src/components/RecommendationPanel";
import type { FurnitureItem, Grid } from "../../src/domain/types";
import type { RecommendationPort, RecommendationResult } from "../../src/ports/recommendation";

const grid: Grid = { floorplanId: "fp-1", rows: 4, cols: 4, cellSizeMeters: 0.5 };

const desk: FurnitureItem = {
  id: "desk-1",
  name: "책상",
  category: "desk",
  size: { w: 1, h: 1 },
  originalImageUrl: "memory://desk.png",
  sourceCell: { row: 0, col: 0 },
};

function stubRecommender(result: RecommendationResult): RecommendationPort {
  return { recommend: vi.fn().mockResolvedValue(result) };
}

describe("RecommendationPanel", () => {
  it("shows reasons for each item after requesting a recommendation", async () => {
    const user = userEvent.setup();
    const recommender = stubRecommender({
      placements: [{ itemId: "desk-1", row: 0, col: 0 }],
      reasons: [{ itemId: "desk-1", text: "벽 쪽에 배치해 동선을 확보했습니다." }],
      unplaced: [],
    });

    render(<RecommendationPanel grid={grid} items={[desk]} recommender={recommender} onApply={vi.fn()} />);
    await user.click(screen.getByRole("button", { name: "추천 받기" }));

    expect(await screen.findByText("책상: 벽 쪽에 배치해 동선을 확보했습니다.")).toBeInTheDocument();
  });

  it("warns about items that could not be placed", async () => {
    const user = userEvent.setup();
    const recommender = stubRecommender({
      placements: [],
      reasons: [],
      unplaced: ["desk-1"],
    });

    render(<RecommendationPanel grid={grid} items={[desk]} recommender={recommender} onApply={vi.fn()} />);
    await user.click(screen.getByRole("button", { name: "추천 받기" }));

    expect(await screen.findByRole("alert")).toHaveTextContent("배치하지 못한 가구: 책상");
  });

  it("applies the recommended placements when confirmed", async () => {
    const user = userEvent.setup();
    const onApply = vi.fn();
    const recommender = stubRecommender({
      placements: [{ itemId: "desk-1", row: 1, col: 2 }],
      reasons: [{ itemId: "desk-1", text: "벽 쪽에 배치해 동선을 확보했습니다." }],
      unplaced: [],
    });

    render(<RecommendationPanel grid={grid} items={[desk]} recommender={recommender} onApply={onApply} />);
    await user.click(screen.getByRole("button", { name: "추천 받기" }));
    await user.click(await screen.findByRole("button", { name: "추천 적용" }));

    expect(onApply).toHaveBeenCalledWith([{ itemId: "desk-1", row: 1, col: 2 }]);
    expect(await screen.findByRole("status")).toHaveTextContent("추천을 적용했습니다.");
  });
});
