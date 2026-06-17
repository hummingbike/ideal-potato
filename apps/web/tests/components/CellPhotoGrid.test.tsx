import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { CellPhotoGrid } from "../../src/components/CellPhotoGrid";
import { InMemoryObjectStorage } from "../../src/ports/objectStorage";
import type { Grid } from "../../src/domain/types";

const grid: Grid = { floorplanId: "fp-1", rows: 2, cols: 3, cellSizeMeters: 0.5 };

describe("CellPhotoGrid", () => {
  it("renders one upload input per cell", () => {
    render(<CellPhotoGrid grid={grid} storage={new InMemoryObjectStorage()} />);
    expect(screen.queryAllByRole("img")).toHaveLength(0);
    for (let row = 0; row < grid.rows; row++) {
      for (let col = 0; col < grid.cols; col++) {
        expect(screen.getByLabelText(`셀 (${row}, ${col}) 사진 업로드`)).toBeInTheDocument();
      }
    }
  });

  it("uploads a photo for a specific cell and shows its thumbnail", async () => {
    const user = userEvent.setup();
    const storage = new InMemoryObjectStorage();
    const onCellPhotoUploaded = vi.fn();
    render(<CellPhotoGrid grid={grid} storage={storage} onCellPhotoUploaded={onCellPhotoUploaded} />);

    const file = new File(["bytes"], "desk.png", { type: "image/png" });
    await user.upload(screen.getByLabelText("셀 (0, 1) 사진 업로드"), file);

    expect(onCellPhotoUploaded).toHaveBeenCalledWith({ row: 0, col: 1, url: expect.stringContaining("memory://") });
    expect(screen.getByAltText("셀 (0, 1) 사진")).toBeInTheDocument();
  });

  it("keeps photos for different cells independent", async () => {
    const user = userEvent.setup();
    const storage = new InMemoryObjectStorage();
    render(<CellPhotoGrid grid={grid} storage={storage} />);

    await user.upload(screen.getByLabelText("셀 (0, 0) 사진 업로드"), new File(["a"], "a.png", { type: "image/png" }));
    await user.upload(screen.getByLabelText("셀 (1, 2) 사진 업로드"), new File(["b"], "b.png", { type: "image/png" }));

    expect(screen.getByAltText("셀 (0, 0) 사진")).toBeInTheDocument();
    expect(screen.getByAltText("셀 (1, 2) 사진")).toBeInTheDocument();
    expect(screen.queryByAltText("셀 (0, 1) 사진")).not.toBeInTheDocument();
  });
});
