import type { SupabaseClient } from "@supabase/supabase-js";
import { describe, expect, it, vi } from "vitest";
import { SupabaseLayoutRepository } from "../../src/ports/layoutRepository";
import type { Layout } from "../../src/domain/types";

/**
 * Supabase's query builder is chainable and itself awaitable (every method
 * returns the same thenable object), so the mock returns one object per
 * table whose chain methods all return itself and which resolves to a
 * configured { data, error } result however far the chain is awaited.
 */
function makeBuilder(result: { data: unknown; error: unknown }) {
  const builder: Record<string, unknown> = {};
  for (const method of ["select", "eq", "in", "delete", "upsert", "insert", "maybeSingle"]) {
    builder[method] = vi.fn(() => builder);
  }
  builder.then = (resolve: (value: typeof result) => unknown, reject?: (reason: unknown) => unknown) =>
    Promise.resolve(result).then(resolve, reject);
  return builder;
}

/**
 * `save()` calls `.from("layout_placements")` twice (once to delete, once
 * to insert) — reuse one builder per table so a test's `builders.<table>`
 * reference sees every call made against that table, not just the last one.
 */
function makeMockClient(responses: Record<string, { data: unknown; error: unknown }>) {
  const builders: Record<string, ReturnType<typeof makeBuilder>> = {};
  const from = vi.fn((table: string) => {
    if (!builders[table]) {
      builders[table] = makeBuilder(responses[table] ?? { data: null, error: null });
    }
    return builders[table];
  });
  return { client: { from } as unknown as SupabaseClient, from, builders };
}

const okResult = { data: null, error: null };

describe("SupabaseLayoutRepository.save", () => {
  const layout: Layout = {
    id: "layout-1",
    floorplanId: "floorplan-1",
    name: "기본 배치",
    createdAt: "2026-06-17T00:00:00.000Z",
    placements: [{ itemId: "desk", row: 0, col: 1 }],
  };

  it("upserts the layout row and replaces its placements", async () => {
    const { client, builders } = makeMockClient({ layouts: okResult, layout_placements: okResult });
    const repo = new SupabaseLayoutRepository(client);

    await repo.save(layout);

    expect(builders.layouts.upsert).toHaveBeenCalledWith({
      id: "layout-1",
      floorplan_id: "floorplan-1",
      name: "기본 배치",
      created_at: "2026-06-17T00:00:00.000Z",
    });
    expect(builders.layout_placements.delete).toHaveBeenCalled();
    expect(builders.layout_placements.eq).toHaveBeenCalledWith("layout_id", "layout-1");
    expect(builders.layout_placements.insert).toHaveBeenCalledWith([
      { layout_id: "layout-1", item_id: "desk", row: 0, col: 1 },
    ]);
  });

  it("skips inserting placements when the layout has none", async () => {
    const { client, builders } = makeMockClient({ layouts: okResult, layout_placements: okResult });
    const repo = new SupabaseLayoutRepository(client);

    await repo.save({ ...layout, placements: [] });

    expect(builders.layout_placements.insert).not.toHaveBeenCalled();
  });

  it("throws when the layout upsert fails", async () => {
    const { client } = makeMockClient({ layouts: { data: null, error: new Error("boom") } });
    const repo = new SupabaseLayoutRepository(client);

    await expect(repo.save(layout)).rejects.toThrow("boom");
  });
});

describe("SupabaseLayoutRepository.findById", () => {
  it("returns undefined when no row matches", async () => {
    const { client } = makeMockClient({ layouts: { data: null, error: null } });
    const repo = new SupabaseLayoutRepository(client);

    expect(await repo.findById("missing")).toBeUndefined();
  });

  it("maps a found layout row and its placements", async () => {
    const { client, builders } = makeMockClient({
      layouts: {
        data: { id: "layout-1", floorplan_id: "floorplan-1", name: "기본 배치", created_at: "2026-06-17T00:00:00.000Z" },
        error: null,
      },
      layout_placements: { data: [{ layout_id: "layout-1", item_id: "desk", row: 0, col: 1 }], error: null },
    });
    const repo = new SupabaseLayoutRepository(client);

    const result = await repo.findById("layout-1");

    expect(builders.layouts.eq).toHaveBeenCalledWith("id", "layout-1");
    expect(result).toEqual({
      id: "layout-1",
      floorplanId: "floorplan-1",
      name: "기본 배치",
      createdAt: "2026-06-17T00:00:00.000Z",
      placements: [{ itemId: "desk", row: 0, col: 1 }],
    });
  });
});

describe("SupabaseLayoutRepository.listByFloorplan", () => {
  it("returns an empty array when no layouts belong to the floorplan", async () => {
    const { client } = makeMockClient({ layouts: { data: [], error: null } });
    const repo = new SupabaseLayoutRepository(client);

    expect(await repo.listByFloorplan("floorplan-1")).toEqual([]);
  });

  it("groups placements under their matching layout", async () => {
    const { client, builders } = makeMockClient({
      layouts: {
        data: [
          { id: "a", floorplan_id: "floorplan-1", name: "A", created_at: "2026-06-17T00:00:00.000Z" },
          { id: "b", floorplan_id: "floorplan-1", name: "B", created_at: "2026-06-17T00:00:01.000Z" },
        ],
        error: null,
      },
      layout_placements: {
        data: [
          { layout_id: "a", item_id: "desk", row: 0, col: 0 },
          { layout_id: "b", item_id: "bed", row: 1, col: 1 },
        ],
        error: null,
      },
    });
    const repo = new SupabaseLayoutRepository(client);

    const result = await repo.listByFloorplan("floorplan-1");

    expect(builders.layout_placements.in).toHaveBeenCalledWith("layout_id", ["a", "b"]);
    expect(result).toEqual([
      {
        id: "a",
        floorplanId: "floorplan-1",
        name: "A",
        createdAt: "2026-06-17T00:00:00.000Z",
        placements: [{ itemId: "desk", row: 0, col: 0 }],
      },
      {
        id: "b",
        floorplanId: "floorplan-1",
        name: "B",
        createdAt: "2026-06-17T00:00:01.000Z",
        placements: [{ itemId: "bed", row: 1, col: 1 }],
      },
    ]);
  });
});
