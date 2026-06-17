"use client";

import { useState, type ChangeEvent } from "react";
import type { ObjectStoragePort } from "../ports/objectStorage";

export interface FloorplanUploadProps {
  storage: ObjectStoragePort;
  onUploaded: (result: { url: string }) => void;
}

export function FloorplanUpload({ storage, onUploaded }: FloorplanUploadProps) {
  const [status, setStatus] = useState<"idle" | "uploading" | "error">("idle");

  async function handleChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;

    setStatus("uploading");
    try {
      const key = `floorplans/${Date.now()}-${file.name}`;
      const result = await storage.upload(key, file);
      setStatus("idle");
      onUploaded(result);
    } catch {
      setStatus("error");
    }
  }

  return (
    <div className="flex flex-col gap-2">
      <label className="flex flex-col gap-1">
        <span>평면도 이미지</span>
        <input type="file" accept="image/*" aria-label="평면도 이미지 업로드" onChange={handleChange} />
      </label>
      {status === "uploading" && <p role="status">업로드 중...</p>}
      {status === "error" && <p role="alert">업로드에 실패했습니다. 다시 시도해주세요.</p>}
    </div>
  );
}
