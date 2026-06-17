import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { FurnitureExtractionPanel } from "../../src/components/FurnitureExtractionPanel";
import { StubSegmentationProvider } from "../../src/ports/segmentation";
import type { CellPhoto } from "../../src/components/CellPhotoGrid";

describe("FurnitureExtractionPanel", () => {
  it("shows a prompt when there are no cell photos yet", () => {
    render(<FurnitureExtractionPanel cellPhotos={[]} segmenter={new StubSegmentationProvider()} onExtracted={vi.fn()} />);
    expect(screen.getByText("먼저 셀에 사진을 등록해주세요.")).toBeInTheDocument();
  });

  it("lists one extraction action per cell photo", () => {
    const cellPhotos: CellPhoto[] = [
      { row: 0, col: 0, url: "memory://a.png" },
      { row: 1, col: 2, url: "memory://b.png" },
    ];
    render(
      <FurnitureExtractionPanel cellPhotos={cellPhotos} segmenter={new StubSegmentationProvider()} onExtracted={vi.fn()} />,
    );
    expect(screen.getAllByRole("button", { name: "가구 추출" })).toHaveLength(2);
  });

  it("extracts furniture for the chosen cell and reports it", async () => {
    const user = userEvent.setup();
    const onExtracted = vi.fn();
    const cellPhotos: CellPhoto[] = [{ row: 0, col: 1, url: "memory://desk.png" }];
    render(
      <FurnitureExtractionPanel cellPhotos={cellPhotos} segmenter={new StubSegmentationProvider()} onExtracted={onExtracted} />,
    );

    await user.click(screen.getByRole("button", { name: "가구 추출" }));

    expect(await screen.findByText("추출 완료")).toBeInTheDocument();
    expect(onExtracted).toHaveBeenCalledTimes(1);
    const [item] = onExtracted.mock.calls[0];
    expect(item).toMatchObject({
      sourceCell: { row: 0, col: 1 },
      originalImageUrl: "memory://desk.png",
      segmentedImageUrl: "memory://desk.png",
    });
  });
});
