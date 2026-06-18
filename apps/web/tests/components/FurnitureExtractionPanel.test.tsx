import { render, screen, within } from "@testing-library/react";
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

  it("extracts furniture using the default metadata when the user doesn't edit anything", async () => {
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
      name: "가구 (0, 1)",
      category: "기타",
      size: { w: 1, h: 1 },
      sourceCell: { row: 0, col: 1 },
      originalImageUrl: "memory://desk.png",
      segmentedImageUrl: "memory://desk.png",
      iconImageUrl: "/icons/generic.svg",
    });
  });

  it("uses the edited name, category and size when extracting", async () => {
    const user = userEvent.setup();
    const onExtracted = vi.fn();
    const cellPhotos: CellPhoto[] = [{ row: 0, col: 0, url: "memory://desk.png" }];
    render(
      <FurnitureExtractionPanel cellPhotos={cellPhotos} segmenter={new StubSegmentationProvider()} onExtracted={onExtracted} />,
    );

    const nameInput = screen.getByLabelText("이름");
    await user.clear(nameInput);
    await user.type(nameInput, "책상");
    await user.selectOptions(screen.getByLabelText("카테고리"), "desk");
    const widthInput = screen.getByLabelText("가로 칸 수");
    await user.clear(widthInput);
    await user.type(widthInput, "2");

    await user.click(screen.getByRole("button", { name: "가구 추출" }));

    expect(await screen.findByText("추출 완료")).toBeInTheDocument();
    const [item] = onExtracted.mock.calls[0];
    expect(item).toMatchObject({ name: "책상", category: "desk", size: { w: 2, h: 1 }, iconImageUrl: "/icons/desk.svg" });
  });

  it("disables extraction and shows errors when the name is cleared", async () => {
    const user = userEvent.setup();
    const cellPhotos: CellPhoto[] = [{ row: 0, col: 0, url: "memory://desk.png" }];
    render(
      <FurnitureExtractionPanel cellPhotos={cellPhotos} segmenter={new StubSegmentationProvider()} onExtracted={vi.fn()} />,
    );

    await user.clear(screen.getByLabelText("이름"));

    expect(screen.getByRole("button", { name: "가구 추출" })).toBeDisabled();
    expect(screen.getByRole("alert")).toHaveTextContent("이름을 입력해주세요.");
  });

  it("keeps each cell photo's metadata form independent", async () => {
    const user = userEvent.setup();
    const cellPhotos: CellPhoto[] = [
      { row: 0, col: 0, url: "memory://a.png" },
      { row: 0, col: 1, url: "memory://b.png" },
    ];
    render(
      <FurnitureExtractionPanel cellPhotos={cellPhotos} segmenter={new StubSegmentationProvider()} onExtracted={vi.fn()} />,
    );

    const items = screen.getAllByRole("listitem");
    const firstNameInput = within(items[0]).getByLabelText("이름");
    await user.clear(firstNameInput);
    await user.type(firstNameInput, "책상");

    expect(within(items[1]).getByLabelText("이름")).toHaveValue("가구 (0, 1)");
  });
});
