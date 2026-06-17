import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { LayoutManager } from "../../src/components/LayoutManager";
import { InMemoryLayoutRepository } from "../../src/ports/layoutRepository";
import type { FurnitureItem } from "../../src/domain/types";

const desk: FurnitureItem = {
  id: "desk-1",
  name: "책상",
  category: "desk",
  size: { w: 1, h: 1 },
  originalImageUrl: "memory://desk.png",
  sourceCell: { row: 0, col: 0 },
};

describe("LayoutManager", () => {
  it("lists layouts already saved for the floorplan", async () => {
    const repository = new InMemoryLayoutRepository();
    await repository.save({
      id: "layout-1",
      floorplanId: "fp-1",
      name: "기존 배치",
      createdAt: "2026-06-17T00:00:00.000Z",
      placements: [{ itemId: "desk-1", row: 0, col: 0 }],
    });

    render(
      <LayoutManager floorplanId="fp-1" items={[desk]} placements={[]} repository={repository} onLoad={vi.fn()} />,
    );

    expect(await screen.findByText("기존 배치")).toBeInTheDocument();
  });

  it("saves the current placements under the entered name and shows a confirmation", async () => {
    const user = userEvent.setup();
    const repository = new InMemoryLayoutRepository();
    const placements = [{ itemId: "desk-1", row: 2, col: 3 }];

    render(
      <LayoutManager
        floorplanId="fp-1"
        items={[desk]}
        placements={placements}
        repository={repository}
        onLoad={vi.fn()}
      />,
    );

    await user.type(screen.getByLabelText("배치 이름"), "내 배치");
    await user.click(screen.getByRole("button", { name: "배치 저장" }));

    expect(await screen.findByRole("status")).toHaveTextContent('"내 배치" 저장됨');
    const saved = await repository.listByFloorplan("fp-1");
    expect(saved).toEqual([
      expect.objectContaining({ name: "내 배치", floorplanId: "fp-1", placements }),
    ]);
    expect(await screen.findByText("내 배치")).toBeInTheDocument();
  });

  it("calls onLoad with the chosen layout", async () => {
    const user = userEvent.setup();
    const repository = new InMemoryLayoutRepository();
    const layout = {
      id: "layout-1",
      floorplanId: "fp-1",
      name: "저장된 배치",
      createdAt: "2026-06-17T00:00:00.000Z",
      placements: [{ itemId: "desk-1", row: 0, col: 0 }],
    };
    await repository.save(layout);
    const onLoad = vi.fn();

    render(
      <LayoutManager floorplanId="fp-1" items={[desk]} placements={[]} repository={repository} onLoad={onLoad} />,
    );

    await user.click(await screen.findByRole("button", { name: "불러오기" }));

    expect(onLoad).toHaveBeenCalledWith(layout);
  });
});
