"use client";

import { useState, type PointerEvent as ReactPointerEvent } from "react";
import { clampBoundingBox, moveBoundingBox, resizeBoundingBox, type ImageBounds } from "../domain/boundingBoxCorrection";
import type { BoundingBox } from "../ports/segmentation";

export interface BoundingBoxCorrectionPanelProps {
  imageUrl: string;
  boundingBox: BoundingBox;
  /** Dimensions of the source image, in the same pixel space as boundingBox. */
  imageBounds: ImageBounds;
  onChange: (box: BoundingBox) => void;
}

type DragMode = "move" | "resize";

interface DragState {
  mode: DragMode;
  pointerId: number;
  startClientX: number;
  startClientY: number;
  startBox: BoundingBox;
}

/**
 * Lets the user drag the detected furniture region (move the box, or resize
 * it from its bottom-right corner) to correct a segmentation misdetection.
 * Only the box's position/size is adjustable here — no mask/brush editing
 * (PRD.md 12절 결정 사항).
 */
export function BoundingBoxCorrectionPanel({ imageUrl, boundingBox, imageBounds, onChange }: BoundingBoxCorrectionPanelProps) {
  const [box, setBox] = useState<BoundingBox>(() => clampBoundingBox(boundingBox, imageBounds));
  const [drag, setDrag] = useState<DragState | null>(null);

  function computeNextBox(event: { clientX: number; clientY: number }, state: DragState): BoundingBox {
    const dx = event.clientX - state.startClientX;
    const dy = event.clientY - state.startClientY;
    return state.mode === "move"
      ? moveBoundingBox(state.startBox, dx, dy, imageBounds)
      : resizeBoundingBox(state.startBox, dx, dy, imageBounds);
  }

  function startDrag(mode: DragMode, event: ReactPointerEvent) {
    setDrag({ mode, pointerId: event.pointerId, startClientX: event.clientX, startClientY: event.clientY, startBox: box });
  }

  function handlePointerMove(event: ReactPointerEvent) {
    if (!drag || event.pointerId !== drag.pointerId) return;
    setBox(computeNextBox(event, drag));
  }

  function endDrag(event: ReactPointerEvent) {
    if (!drag || event.pointerId !== drag.pointerId) return;
    const finalBox = computeNextBox(event, drag);
    setDrag(null);
    setBox(finalBox);
    onChange(finalBox);
  }

  function handleReset() {
    const reset = clampBoundingBox(boundingBox, imageBounds);
    setBox(reset);
    onChange(reset);
  }

  return (
    <div className="flex flex-col gap-2">
      <div
        data-testid="bounding-box-correction"
        style={{
          position: "relative",
          width: imageBounds.width,
          height: imageBounds.height,
          touchAction: "none",
          overflow: "hidden",
        }}
        onPointerMove={handlePointerMove}
        onPointerUp={endDrag}
        onPointerCancel={endDrag}
      >
        <img
          src={imageUrl}
          alt="세그멘테이션 원본 사진"
          style={{ position: "absolute", left: 0, top: 0, width: imageBounds.width, height: imageBounds.height }}
        />
        <div
          data-testid="bounding-box"
          role="button"
          aria-label="인식 영역 이동"
          onPointerDown={(event) => startDrag("move", event)}
          style={{
            position: "absolute",
            left: box.x,
            top: box.y,
            width: box.width,
            height: box.height,
            border: "2px solid #ef4444",
            cursor: "move",
            touchAction: "none",
          }}
        >
          <div
            data-testid="bounding-box-resize-handle"
            role="button"
            aria-label="인식 영역 크기 조절"
            onPointerDown={(event) => {
              event.stopPropagation();
              startDrag("resize", event);
            }}
            style={{
              position: "absolute",
              right: -6,
              bottom: -6,
              width: 12,
              height: 12,
              background: "#ef4444",
              cursor: "nwse-resize",
              touchAction: "none",
            }}
          />
        </div>
      </div>
      <p>{`위치 (${Math.round(box.x)}, ${Math.round(box.y)}) · 크기 ${Math.round(box.width)} x ${Math.round(box.height)}`}</p>
      <button type="button" onClick={handleReset}>
        자동 인식 영역으로 되돌리기
      </button>
    </div>
  );
}
