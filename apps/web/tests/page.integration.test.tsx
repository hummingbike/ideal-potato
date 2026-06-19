import { fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import HomePage from "../app/page";

function pointerEvent(type: string, props: { clientX: number; clientY: number; pointerId?: number }): Event {
  const event = new Event(type, { bubbles: true });
  Object.assign(event, { pointerId: 1, ...props });
  return event;
}

describe("HomePage golden path", () => {
  it("walks through outline -> grid -> cell photo -> extraction -> correction -> board -> recommendation -> save", async () => {
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

    // 4b. Correct the detected region by shrinking it from its corner handle
    expect(screen.getByText("위치 (0, 0) · 크기 200 x 200")).toBeInTheDocument();
    const resizeHandle = screen.getByTestId("bounding-box-resize-handle");
    fireEvent(resizeHandle, pointerEvent("pointerdown", { clientX: 0, clientY: 0 }));
    fireEvent(resizeHandle, pointerEvent("pointermove", { clientX: -50, clientY: -50 }));
    fireEvent(resizeHandle, pointerEvent("pointerup", { clientX: -50, clientY: -50 }));
    expect(screen.getByText("위치 (0, 0) · 크기 150 x 150")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "보드로 이동" }));

    // 5. The extracted item is rendered on the board
    const board = await screen.findByTestId("furniture-board");
    expect(board.querySelector('[data-item-id="furniture-0-0"]')).not.toBeNull();

    // 6. Request an AI recommendation, apply it, then undo it
    await user.click(screen.getByRole("button", { name: "추천 받기" }));
    expect(await screen.findByText("가구 (0, 0): 벽 쪽에 배치해 동선을 확보했습니다.")).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "추천 적용" }));
    expect(await screen.findByText("추천을 적용했습니다.")).toBeInTheDocument();
    await user.click(await screen.findByRole("button", { name: "되돌리기" }));
    expect(screen.queryByRole("button", { name: "되돌리기" })).not.toBeInTheDocument();

    // 7. Saving the current arrangement shows a confirmation
    await user.type(screen.getByLabelText("배치 이름"), "테스트 배치");
    await user.click(screen.getByRole("button", { name: "배치 저장" }));
    expect(await screen.findByText('"테스트 배치" 저장됨')).toBeInTheDocument();
  });
});
