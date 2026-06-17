import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { DimensionForm } from "../../src/components/DimensionForm";

describe("DimensionForm", () => {
  it("calls onSubmit with the parsed outline for valid input", async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();
    render(<DimensionForm onSubmit={onSubmit} />);

    await user.type(screen.getByLabelText("가로 길이(미터)"), "4");
    await user.type(screen.getByLabelText("세로 길이(미터)"), "3.5");
    await user.click(screen.getByRole("button", { name: "평면도 생성" }));

    expect(onSubmit).toHaveBeenCalledWith({ widthMeters: 4, heightMeters: 3.5 });
  });

  it("shows a validation error and does not submit for an out-of-range value", async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();
    render(<DimensionForm onSubmit={onSubmit} />);

    await user.type(screen.getByLabelText("가로 길이(미터)"), "0.1");
    await user.type(screen.getByLabelText("세로 길이(미터)"), "3");
    await user.click(screen.getByRole("button", { name: "평면도 생성" }));

    expect(await screen.findByRole("alert")).toHaveTextContent("가로 길이는 0.5m ~ 50m 사이여야 합니다.");
    expect(onSubmit).not.toHaveBeenCalled();
  });
});
