import { FURNITURE_CATEGORIES } from "./furnitureIcon";
import type { ItemSize } from "./types";

export interface FurnitureMetadataInput {
  name: string;
  category: string;
  size: ItemSize;
}

export type FurnitureMetadataValidationResult =
  | { ok: true; metadata: FurnitureMetadataInput }
  | { ok: false; errors: string[] };

export const MIN_ITEM_CELLS = 1;
export const MAX_ITEM_CELLS = 10;

function validateCellCount(value: number, label: string): string | null {
  if (!Number.isInteger(value) || value < MIN_ITEM_CELLS || value > MAX_ITEM_CELLS) {
    return `${label}는 ${MIN_ITEM_CELLS}~${MAX_ITEM_CELLS} 사이의 정수여야 합니다.`;
  }
  return null;
}

/** Validates the name/category/size a user enters for a piece of furniture before extraction. */
export function validateFurnitureMetadata(input: FurnitureMetadataInput): FurnitureMetadataValidationResult {
  const errors: string[] = [];

  if (input.name.trim().length === 0) {
    errors.push("이름을 입력해주세요.");
  }
  if (!FURNITURE_CATEGORIES.includes(input.category)) {
    errors.push("카테고리를 선택해주세요.");
  }
  const widthError = validateCellCount(input.size.w, "가로 칸 수");
  if (widthError) errors.push(widthError);
  const heightError = validateCellCount(input.size.h, "세로 칸 수");
  if (heightError) errors.push(heightError);

  if (errors.length > 0) {
    return { ok: false, errors };
  }

  return { ok: true, metadata: { name: input.name.trim(), category: input.category, size: input.size } };
}
