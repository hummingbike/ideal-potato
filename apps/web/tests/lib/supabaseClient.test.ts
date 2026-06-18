import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const ORIGINAL_ENV = { ...process.env };

describe("getSupabaseClient", () => {
  beforeEach(() => {
    vi.resetModules();
    delete process.env.NEXT_PUBLIC_SUPABASE_URL;
    delete process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  });

  afterEach(() => {
    process.env = { ...ORIGINAL_ENV };
  });

  it("returns undefined when the env vars are not set", async () => {
    const { getSupabaseClient } = await import("../../src/lib/supabaseClient");
    expect(getSupabaseClient()).toBeUndefined();
  });

  it("returns undefined when only one of the two env vars is set", async () => {
    process.env.NEXT_PUBLIC_SUPABASE_URL = "https://example.supabase.co";
    const { getSupabaseClient } = await import("../../src/lib/supabaseClient");
    expect(getSupabaseClient()).toBeUndefined();
  });

  it("returns the same client instance on repeated calls once both env vars are set", async () => {
    process.env.NEXT_PUBLIC_SUPABASE_URL = "https://example.supabase.co";
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = "anon-key";
    const { getSupabaseClient } = await import("../../src/lib/supabaseClient");

    const first = getSupabaseClient();
    const second = getSupabaseClient();

    expect(first).toBeDefined();
    expect(first).toBe(second);
  });
});
