"use client";

import { useState, type FormEvent } from "react";
import { validateDimensions } from "../domain/outline";
import type { Outline } from "../domain/types";

export interface DimensionFormProps {
  onSubmit: (outline: Outline) => void;
}

export function DimensionForm({ onSubmit }: DimensionFormProps) {
  const [width, setWidth] = useState("");
  const [height, setHeight] = useState("");
  const [errors, setErrors] = useState<string[]>([]);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const result = validateDimensions({
      widthMeters: Number.parseFloat(width),
      heightMeters: Number.parseFloat(height),
    });

    if (!result.ok) {
      setErrors(result.errors);
      return;
    }

    setErrors([]);
    onSubmit(result.outline);
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3">
      <label className="flex flex-col gap-1">
        <span>가로 (m)</span>
        <input
          type="number"
          step="0.1"
          value={width}
          onChange={(event) => setWidth(event.target.value)}
          aria-label="가로 길이(미터)"
        />
      </label>
      <label className="flex flex-col gap-1">
        <span>세로 (m)</span>
        <input
          type="number"
          step="0.1"
          value={height}
          onChange={(event) => setHeight(event.target.value)}
          aria-label="세로 길이(미터)"
        />
      </label>
      {errors.length > 0 && (
        <ul role="alert" className="text-sm text-red-600">
          {errors.map((error) => (
            <li key={error}>{error}</li>
          ))}
        </ul>
      )}
      <button type="submit">평면도 생성</button>
    </form>
  );
}
