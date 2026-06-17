import type { Outline } from "./types";

export interface DimensionInput {
  widthMeters: number;
  heightMeters: number;
}

export type DimensionValidationResult = { ok: true; outline: Outline } | { ok: false; errors: string[] };

export const MIN_ROOM_METERS = 0.5;
export const MAX_ROOM_METERS = 50;

function validateLength(value: number, label: string): string | null {
  if (!Number.isFinite(value) || value < MIN_ROOM_METERS || value > MAX_ROOM_METERS) {
    return `${label}는 ${MIN_ROOM_METERS}m ~ ${MAX_ROOM_METERS}m 사이여야 합니다.`;
  }
  return null;
}

/** Validates a width/height dimension form input and turns it into a rectangular room Outline. */
export function validateDimensions(input: DimensionInput): DimensionValidationResult {
  const errors = [validateLength(input.widthMeters, "가로 길이"), validateLength(input.heightMeters, "세로 길이")].filter(
    (error): error is string => error !== null,
  );

  if (errors.length > 0) {
    return { ok: false, errors };
  }

  return {
    ok: true,
    outline: { widthMeters: input.widthMeters, heightMeters: input.heightMeters },
  };
}
