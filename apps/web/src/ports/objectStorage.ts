import type { SupabaseClient } from "@supabase/supabase-js";

/**
 * Abstraction over wherever photos (floorplan, cell, furniture) end up
 * living. `SupabaseObjectStorage` is the real implementation (Supabase
 * Storage); `InMemoryObjectStorage` stands in for local dev/tests without a
 * Supabase project.
 */
export interface ObjectStoragePort {
  upload(key: string, file: Blob): Promise<{ url: string }>;
  getUrl(key: string): string | undefined;
}

/**
 * In-memory stand-in for ObjectStoragePort, used until a real backend
 * (Supabase Storage) is wired in. Keeps blobs in a Map and returns
 * deterministic `memory://<key>` URLs instead of relying on
 * `URL.createObjectURL`, which isn't reliably available in jsdom.
 */
export class InMemoryObjectStorage implements ObjectStoragePort {
  private readonly files = new Map<string, Blob>();

  async upload(key: string, file: Blob): Promise<{ url: string }> {
    this.files.set(key, file);
    return { url: this.urlFor(key) };
  }

  getUrl(key: string): string | undefined {
    return this.files.has(key) ? this.urlFor(key) : undefined;
  }

  getFile(key: string): Blob | undefined {
    return this.files.get(key);
  }

  private urlFor(key: string): string {
    return `memory://${key}`;
  }
}

/**
 * Uploads to a Supabase Storage bucket and returns its public URL (the
 * "photos" bucket is public — PLAN.md Phase 3). `getUrl` only tracks keys
 * uploaded via this instance during the current session (no bucket
 * listing/existence check); the app doesn't currently call `getUrl` outside
 * of that same-session pattern.
 */
export class SupabaseObjectStorage implements ObjectStoragePort {
  private readonly uploadedKeys = new Set<string>();

  constructor(
    private readonly client: SupabaseClient,
    private readonly bucket: string = "photos",
  ) {}

  async upload(key: string, file: Blob): Promise<{ url: string }> {
    const { error } = await this.client.storage.from(this.bucket).upload(key, file, { upsert: true });
    if (error) throw error;
    this.uploadedKeys.add(key);
    return { url: this.publicUrlFor(key) };
  }

  getUrl(key: string): string | undefined {
    return this.uploadedKeys.has(key) ? this.publicUrlFor(key) : undefined;
  }

  private publicUrlFor(key: string): string {
    return this.client.storage.from(this.bucket).getPublicUrl(key).data.publicUrl;
  }
}
