import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { LayoutManager } from "../../src/components/LayoutManager";
import { InMemoryLayoutRepository } from "../../src/ports/layoutRepository";
import type { FurnitureItem, Grid } from "../../src/domain/types";

const grid: Grid = { floorplanId: "fp-1", rows: 4, cols: 4, cellSizeMeters: 0.5 };

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
      <LayoutManager floorplanId="fp-1" grid={grid} items={[desk]} placements={[]} repository={repository} onLoad={vi.fn()} />,
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
        grid={grid}
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
      <LayoutManager floorplanId="fp-1" grid={grid} items={[desk]} placements={[]} repository={repository} onLoad={onLoad} />,
    );

    await user.click(await screen.findByRole("button", { name: "불러오기" }));

    expect(onLoad).toHaveBeenCalledWith(layout);
  });

  it("shows a side-by-side comparison once two layouts are selected, and hides it when closed", async () => {
    const user = userEvent.setup();
    const repository = new InMemoryLayoutRepository();
    await repository.save({
      id: "layout-1",
      floorplanId: "fp-1",
      name: "배치 A",
      createdAt: "2026-06-17T00:00:00.000Z",
      placements: [{ itemId: "desk-1", row: 0, col: 0 }],
    });
    await repository.save({
      id: "layout-2",
      floorplanId: "fp-1",
      name: "배치 B",
      createdAt: "2026-06-18T00:00:00.000Z",
      placements: [{ itemId: "desk-1", row: 1, col: 1 }],
    });

    render(
      <LayoutManager floorplanId="fp-1" grid={grid} items={[desk]} placements={[]} repository={repository} onLoad={vi.fn()} />,
    );

    await user.click(await screen.findByLabelText("배치 A 비교용 선택"));
    expect(screen.queryByTestId("layout-comparison")).not.toBeInTheDocument();

    await user.click(screen.getByLabelText("배치 B 비교용 선택"));
    expect(await screen.findByTestId("layout-comparison")).toBeInTheDocument();
    expect(screen.getByText("이전: 배치 A")).toBeInTheDocument();
    expect(screen.getByText("이후: 배치 B")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "비교 닫기" }));
    expect(screen.queryByTestId("layout-comparison")).not.toBeInTheDocument();
  });

  it("disables further selection once two layouts are already selected for comparison", async () => {
    const user = userEvent.setup();
    const repository = new InMemoryLayoutRepository();
    await repository.save({
      id: "layout-1",
      floorplanId: "fp-1",
      name: "배치 A",
      createdAt: "2026-06-17T00:00:00.000Z",
      placements: [],
    });
    await repository.save({
      id: "layout-2",
      floorplanId: "fp-1",
      name: "배치 B",
      createdAt: "2026-06-18T00:00:00.000Z",
      placements: [],
    });
    await repository.save({
      id: "layout-3",
      floorplanId: "fp-1",
      name: "배치 C",
      createdAt: "2026-06-19T00:00:00.000Z",
      placements: [],
    });

    render(
      <LayoutManager floorplanId="fp-1" grid={grid} items={[desk]} placements={[]} repository={repository} onLoad={vi.fn()} />,
    );

    await user.click(await screen.findByLabelText("배치 A 비교용 선택"));
    await user.click(screen.getByLabelText("배치 B 비교용 선택"));

    expect(screen.getByLabelText("배치 C 비교용 선택")).toBeDisabled();
  });
});
