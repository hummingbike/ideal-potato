import { describe, expect, it } from "vitest";
import { validateDimensions } from "../../src/domain/outline";

describe("validateDimensions", () => {
  it("returns an outline for valid width/height", () => {
    const result = validateDimensions({ widthMeters: 4, heightMeters: 3.5 });
    expect(result).toEqual({ ok: true, outline: { widthMeters: 4, heightMeters: 3.5 } });
  });

  it("rejects a width below the minimum", () => {
    const result = validateDimensions({ widthMeters: 0.1, heightMeters: 3 });
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.errors).toEqual(["가로 길이는 0.5m ~ 50m 사이여야 합니다."]);
    }
  });

  it("rejects a height above the maximum", () => {
    const result = validateDimensions({ widthMeters: 4, heightMeters: 200 });
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.errors).toEqual(["세로 길이는 0.5m ~ 50m 사이여야 합니다."]);
    }
  });

  it("collects errors for both dimensions when both are invalid", () => {
    const result = validateDimensions({ widthMeters: Number.NaN, heightMeters: -1 });
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.errors).toHaveLength(2);
    }
  });
});
