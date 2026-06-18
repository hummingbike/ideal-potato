import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { BoundingBoxCorrectionPanel } from "../../src/components/BoundingBoxCorrectionPanel";

const imageBounds = { width: 200, height: 200 };
const initialBox = { x: 10, y: 10, width: 50, height: 50 };

/**
 * jsdom doesn't implement the PointerEvent constructor, so build a plain
 * Event with clientX/clientY/pointerId attached (same approach as the
 * grid-canvas pointer-drag tests) and dispatch it via fireEvent, which wraps
 * each call in act() so React re-renders between events and later handlers
 * see up-to-date drag state.
 */
function pointerEvent(type: string, props: { clientX: number; clientY: number; pointerId?: number }): Event {
  const event = new Event(type, { bubbles: true });
  Object.assign(event, { pointerId: 1, ...props });
  return event;
}

function drag(el: Element, path: { clientX: number; clientY: number }[]): void {
  const [start, ...rest] = path;
  fireEvent(el, pointerEvent("pointerdown", start));
  for (const point of rest) {
    fireEvent(el, pointerEvent("pointermove", point));
  }
  fireEvent(el, pointerEvent("pointerup", path[path.length - 1]));
}

describe("BoundingBoxCorrectionPanel", () => {
  it("renders the photo and the detected box at its initial position", () => {
    render(
      <BoundingBoxCorrectionPanel imageUrl="memory://desk.png" boundingBox={initialBox} imageBounds={imageBounds} onChange={vi.fn()} />,
    );

    const box = screen.getByTestId("bounding-box");
    expect(box).toHaveStyle({ left: "10px", top: "10px", width: "50px", height: "50px" });
    expect(screen.getByText("위치 (10, 10) · 크기 50 x 50")).toBeInTheDocument();
  });

  it("moves the box by dragging its body and reports the corrected box", () => {
    const onChange = vi.fn();
    render(
      <BoundingBoxCorrectionPanel imageUrl="memory://desk.png" boundingBox={initialBox} imageBounds={imageBounds} onChange={onChange} />,
    );

    drag(screen.getByTestId("bounding-box"), [
      { clientX: 0, clientY: 0 },
      { clientX: 20, clientY: 5 },
    ]);

    expect(onChange).toHaveBeenCalledWith({ x: 30, y: 15, width: 50, height: 50 });
    expect(screen.getByText("위치 (30, 15) · 크기 50 x 50")).toBeInTheDocument();
  });

  it("resizes the box by dragging its corner handle without moving its origin", () => {
    const onChange = vi.fn();
    render(
      <BoundingBoxCorrectionPanel imageUrl="memory://desk.png" boundingBox={initialBox} imageBounds={imageBounds} onChange={onChange} />,
    );

    drag(screen.getByTestId("bounding-box-resize-handle"), [
      { clientX: 0, clientY: 0 },
      { clientX: 15, clientY: -10 },
    ]);

    expect(onChange).toHaveBeenCalledWith({ x: 10, y: 10, width: 65, height: 40 });
  });

  it("clamps a corrected box so it can't be dragged off the image", () => {
    const onChange = vi.fn();
    render(
      <BoundingBoxCorrectionPanel imageUrl="memory://desk.png" boundingBox={initialBox} imageBounds={imageBounds} onChange={onChange} />,
    );

    drag(screen.getByTestId("bounding-box"), [
      { clientX: 0, clientY: 0 },
      { clientX: 1000, clientY: 1000 },
    ]);

    expect(onChange).toHaveBeenCalledWith({ x: 150, y: 150, width: 50, height: 50 });
  });

  it("resets to the original detected box on demand", () => {
    const onChange = vi.fn();
    render(
      <BoundingBoxCorrectionPanel imageUrl="memory://desk.png" boundingBox={initialBox} imageBounds={imageBounds} onChange={onChange} />,
    );

    drag(screen.getByTestId("bounding-box"), [
      { clientX: 0, clientY: 0 },
      { clientX: 20, clientY: 5 },
    ]);
    onChange.mockClear();

    fireEvent.click(screen.getByRole("button", { name: "자동 인식 영역으로 되돌리기" }));

    expect(onChange).toHaveBeenCalledWith(initialBox);
    expect(screen.getByText("위치 (10, 10) · 크기 50 x 50")).toBeInTheDocument();
  });
});
