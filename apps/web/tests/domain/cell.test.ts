import { describe, expect, it } from "vitest";
import { cellKey } from "../../src/domain/cell";

describe("cellKey", () => {
  it("combines row and col into a stable string key", () => {
    expect(cellKey(0, 0)).toBe("0-0");
    expect(cellKey(2, 5)).toBe("2-5");
  });

  it("produces distinct keys for transposed positions", () => {
    expect(cellKey(1, 2)).not.toBe(cellKey(2, 1));
  });
});
