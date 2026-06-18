import type { SupabaseClient } from "@supabase/supabase-js";
import { describe, expect, it, vi } from "vitest";
import { SupabaseObjectStorage } from "../../src/ports/objectStorage";

function makeMockClient(uploadResult: { error: unknown } = { error: null }) {
  const upload = vi.fn(async () => uploadResult);
  const getPublicUrl = vi.fn((path: string) => ({ data: { publicUrl: `https://example.supabase.co/storage/v1/object/public/photos/${path}` } }));
  const from = vi.fn(() => ({ upload, getPublicUrl }));
  const client = { storage: { from } } as unknown as SupabaseClient;
  return { client, upload, getPublicUrl, from };
}

describe("SupabaseObjectStorage.upload", () => {
  it("uploads to the bucket and returns the object's public URL", async () => {
    const { client, upload, from } = makeMockClient();
    const storage = new SupabaseObjectStorage(client);
    const blob = new Blob(["photo bytes"], { type: "image/png" });

    const { url } = await storage.upload("cells/0-0.png", blob);

    expect(from).toHaveBeenCalledWith("photos");
    expect(upload).toHaveBeenCalledWith("cells/0-0.png", blob, { upsert: true });
    expect(url).toBe("https://example.supabase.co/storage/v1/object/public/photos/cells/0-0.png");
  });

  it("uploads to a custom bucket when one is given", async () => {
    const { client, from } = makeMockClient();
    const storage = new SupabaseObjectStorage(client, "custom-bucket");

    await storage.upload("a.png", new Blob(["bytes"]));

    expect(from).toHaveBeenCalledWith("custom-bucket");
  });

  it("throws when the upload fails", async () => {
    const { client } = makeMockClient({ error: new Error("upload failed") });
    const storage = new SupabaseObjectStorage(client);

    await expect(storage.upload("a.png", new Blob(["bytes"]))).rejects.toThrow("upload failed");
  });
});

describe("SupabaseObjectStorage.getUrl", () => {
  it("returns undefined for a key that was never uploaded through this instance", () => {
    const { client } = makeMockClient();
    const storage = new SupabaseObjectStorage(client);

    expect(storage.getUrl("missing.png")).toBeUndefined();
  });

  it("returns the public URL for a key uploaded earlier in the session", async () => {
    const { client } = makeMockClient();
    const storage = new SupabaseObjectStorage(client);
    await storage.upload("cells/0-0.png", new Blob(["bytes"]));

    expect(storage.getUrl("cells/0-0.png")).toBe(
      "https://example.supabase.co/storage/v1/object/public/photos/cells/0-0.png",
    );
  });
});
