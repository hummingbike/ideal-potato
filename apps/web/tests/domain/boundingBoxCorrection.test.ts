import { describe, expect, it } from "vitest";
import { clampBoundingBox, moveBoundingBox, resizeBoundingBox } from "../../src/domain/boundingBoxCorrection";

const bounds = { width: 200, height: 200 };

describe("clampBoundingBox", () => {
  it("leaves a box that already fits unchanged", () => {
    expect(clampBoundingBox({ x: 10, y: 10, width: 80, height: 60 }, bounds)).toEqual({
      x: 10,
      y: 10,
      width: 80,
      height: 60,
    });
  });

  it("pulls a box back inside the image when it overflows the right/bottom edge", () => {
    expect(clampBoundingBox({ x: 150, y: 180, width: 80, height: 60 }, bounds)).toEqual({
      x: 120,
      y: 140,
      width: 80,
      height: 60,
    });
  });

  it("clamps a negative position to the top-left corner", () => {
    expect(clampBoundingBox({ x: -20, y: -5, width: 50, height: 50 }, bounds)).toEqual({
      x: 0,
      y: 0,
      width: 50,
      height: 50,
    });
  });

  it("enforces the minimum box size", () => {
    expect(clampBoundingBox({ x: 0, y: 0, width: 2, height: 1 }, bounds)).toEqual({ x: 0, y: 0, width: 8, height: 8 });
  });

  it("never grows a box past the image dimensions", () => {
    expect(clampBoundingBox({ x: 0, y: 0, width: 500, height: 500 }, bounds)).toEqual({
      x: 0,
      y: 0,
      width: 200,
      height: 200,
    });
  });
});

describe("moveBoundingBox", () => {
  it("translates the box by the given delta", () => {
    expect(moveBoundingBox({ x: 10, y: 10, width: 50, height: 50 }, 20, -5, bounds)).toEqual({
      x: 30,
      y: 5,
      width: 50,
      height: 50,
    });
  });

  it("stops at the image edge instead of moving the box out of bounds", () => {
    expect(moveBoundingBox({ x: 10, y: 10, width: 50, height: 50 }, 1000, 1000, bounds)).toEqual({
      x: 150,
      y: 150,
      width: 50,
      height: 50,
    });
  });
});

describe("resizeBoundingBox", () => {
  it("grows the box from its bottom-right corner", () => {
    expect(resizeBoundingBox({ x: 10, y: 10, width: 50, height: 50 }, 20, 10, bounds)).toEqual({
      x: 10,
      y: 10,
      width: 70,
      height: 60,
    });
  });

  it("does not shrink the box below the minimum size", () => {
    expect(resizeBoundingBox({ x: 10, y: 10, width: 50, height: 50 }, -1000, -1000, bounds)).toEqual({
      x: 10,
      y: 10,
      width: 8,
      height: 8,
    });
  });

  it("does not grow the box past the image's right/bottom edge", () => {
    expect(resizeBoundingBox({ x: 150, y: 150, width: 50, height: 50 }, 1000, 1000, bounds)).toEqual({
      x: 150,
      y: 150,
      width: 50,
      height: 50,
    });
  });
});
