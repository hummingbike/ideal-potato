import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import HomePage from "../app/page";

describe("HomePage golden path", () => {
  it("walks through outline -> grid -> cell photo -> extraction -> board -> save", async () => {
    const user = userEvent.setup();
    render(<HomePage />);

    // 1. Room dimensions
    await user.type(screen.getByLabelText("가로 길이(미터)"), "4");
    await user.type(screen.getByLabelText("세로 길이(미터)"), "3");
    await user.click(screen.getByRole("button", { name: "평면도 생성" }));

    // 2. Grid (default 0.5m cell size -> 6 x 8)
    expect(await screen.findByTestId("grid-preview")).toHaveTextContent("6 x 8 그리드가 생성됩니다.");
    await user.click(screen.getByRole("button", { name: "그리드 생성" }));

    // 3. Upload a photo for one cell, then continue
    const photo = new File(["bytes"], "desk.png", { type: "image/png" });
    await user.upload(await screen.findByLabelText("셀 (0, 0) 사진 업로드"), photo);
    await user.click(screen.getByRole("button", { name: "다음" }));

    // 4. Extract furniture from that cell's photo
    await user.click(await screen.findByRole("button", { name: "가구 추출" }));
    expect(await screen.findByText("추출 완료")).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "보드로 이동" }));

    // 5. The extracted item is rendered on the board
    const board = await screen.findByTestId("furniture-board");
    expect(board.querySelector('[data-item-id="furniture-0-0"]')).not.toBeNull();

    // 6. Saving the current arrangement shows a confirmation
    await user.type(screen.getByLabelText("배치 이름"), "테스트 배치");
    await user.click(screen.getByRole("button", { name: "배치 저장" }));
    expect(await screen.findByRole("status")).toHaveTextContent('"테스트 배치" 저장됨');
  });
});
