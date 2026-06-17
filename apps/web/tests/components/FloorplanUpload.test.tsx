import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { FloorplanUpload } from "../../src/components/FloorplanUpload";
import { InMemoryObjectStorage } from "../../src/ports/objectStorage";
import type { ObjectStoragePort } from "../../src/ports/objectStorage";

describe("FloorplanUpload", () => {
  it("uploads the selected file and reports the resulting url", async () => {
    const user = userEvent.setup();
    const storage = new InMemoryObjectStorage();
    const onUploaded = vi.fn();
    render(<FloorplanUpload storage={storage} onUploaded={onUploaded} />);

    const file = new File(["image bytes"], "room.png", { type: "image/png" });
    await user.upload(screen.getByLabelText("평면도 이미지 업로드"), file);

    expect(onUploaded).toHaveBeenCalledTimes(1);
    const [{ url }] = onUploaded.mock.calls[0];
    expect(url).toMatch(/^memory:\/\/floorplans\/.*room\.png$/);
  });

  it("shows an error message when the upload fails", async () => {
    const user = userEvent.setup();
    const failingStorage: ObjectStoragePort = {
      upload: vi.fn().mockRejectedValue(new Error("network down")),
      getUrl: vi.fn(),
    };
    const onUploaded = vi.fn();
    render(<FloorplanUpload storage={failingStorage} onUploaded={onUploaded} />);

    const file = new File(["image bytes"], "room.png", { type: "image/png" });
    await user.upload(screen.getByLabelText("평면도 이미지 업로드"), file);

    expect(await screen.findByRole("alert")).toHaveTextContent("업로드에 실패했습니다. 다시 시도해주세요.");
    expect(onUploaded).not.toHaveBeenCalled();
  });
});
