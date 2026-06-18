import { describe, expect, it } from "vitest";
import { validateFurnitureMetadata } from "../../src/domain/furnitureMetadata";

describe("validateFurnitureMetadata", () => {
  it("accepts a valid name, category and size", () => {
    const result = validateFurnitureMetadata({ name: "책상", category: "desk", size: { w: 2, h: 1 } });
    expect(result).toEqual({ ok: true, metadata: { name: "책상", category: "desk", size: { w: 2, h: 1 } } });
  });

  it("trims whitespace from the name", () => {
    const result = validateFurnitureMetadata({ name: "  책상  ", category: "desk", size: { w: 1, h: 1 } });
    expect(result.ok).toBe(true);
    expect(result.ok && result.metadata.name).toBe("책상");
  });

  it("rejects an empty name", () => {
    const result = validateFurnitureMetadata({ name: "   ", category: "desk", size: { w: 1, h: 1 } });
    expect(result).toEqual({ ok: false, errors: ["이름을 입력해주세요."] });
  });

  it("rejects a category outside the known list", () => {
    const result = validateFurnitureMetadata({ name: "책상", category: "스피커", size: { w: 1, h: 1 } });
    expect(result).toEqual({ ok: false, errors: ["카테고리를 선택해주세요."] });
  });

  it("rejects a non-integer or out-of-range size", () => {
    const result = validateFurnitureMetadata({ name: "책상", category: "desk", size: { w: 0, h: 11 } });
    expect(result).toEqual({
      ok: false,
      errors: ["가로 칸 수는 1~10 사이의 정수여야 합니다.", "세로 칸 수는 1~10 사이의 정수여야 합니다."],
    });
  });

  it("collects all errors at once", () => {
    const result = validateFurnitureMetadata({ name: "", category: "스피커", size: { w: 0, h: 0 } });
    expect(result.ok).toBe(false);
    expect(result.ok || result.errors).toHaveLength(4);
  });
});
