import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { GridSizeForm } from "../../src/components/GridSizeForm";

const outline = { widthMeters: 4, heightMeters: 3 };

describe("GridSizeForm", () => {
  it("shows a live preview of the resulting grid for the default cell size", () => {
    render(<GridSizeForm floorplanId="fp-1" outline={outline} onSubmit={vi.fn()} />);
    expect(screen.getByTestId("grid-preview")).toHaveTextContent("6 x 8 그리드가 생성됩니다.");
  });

  it("updates the preview as the user changes the cell size", async () => {
    const user = userEvent.setup();
    render(<GridSizeForm floorplanId="fp-1" outline={outline} onSubmit={vi.fn()} />);

    const input = screen.getByLabelText("셀 크기(미터)");
    await user.clear(input);
    await user.type(input, "1");

    expect(screen.getByTestId("grid-preview")).toHaveTextContent("3 x 4 그리드가 생성됩니다.");
  });

  it("calls onSubmit with the computed grid for a valid cell size", async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();
    render(<GridSizeForm floorplanId="fp-1" outline={outline} onSubmit={onSubmit} />);

    await user.click(screen.getByRole("button", { name: "그리드 생성" }));

    expect(onSubmit).toHaveBeenCalledWith({ floorplanId: "fp-1", rows: 6, cols: 8, cellSizeMeters: 0.5 });
  });

  it("shows a validation error and does not submit for an out-of-range cell size", async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();
    render(<GridSizeForm floorplanId="fp-1" outline={outline} onSubmit={onSubmit} />);

    const input = screen.getByLabelText("셀 크기(미터)");
    await user.clear(input);
    await user.type(input, "5");
    await user.click(screen.getByRole("button", { name: "그리드 생성" }));

    expect(await screen.findByRole("alert")).toHaveTextContent("셀 크기는 0.1m ~ 2m 사이여야 합니다.");
    expect(onSubmit).not.toHaveBeenCalled();
  });
});
