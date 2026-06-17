/**
 * Abstraction over wherever photos (floorplan, cell, furniture) end up
 * living. The real implementation (Supabase Storage) isn't wired up yet —
 * see PLAN.md Phase 2 — so every caller in this app depends on this
 * interface instead of a concrete client.
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
