import { describe, expect, it } from "vitest";
import { InMemoryLayoutRepository } from "../../src/ports/layoutRepository";
import type { Layout } from "../../src/domain/types";

function makeLayout(overrides: Partial<Layout> = {}): Layout {
  return {
    id: "layout-1",
    floorplanId: "floorplan-1",
    name: "기본 배치",
    createdAt: "2026-06-17T00:00:00.000Z",
    placements: [{ itemId: "desk", row: 0, col: 0 }],
    ...overrides,
  };
}

describe("InMemoryLayoutRepository", () => {
  it("returns undefined for an id that was never saved", async () => {
    const repo = new InMemoryLayoutRepository();
    expect(await repo.findById("missing")).toBeUndefined();
  });

  it("saves and retrieves a layout by id", async () => {
    const repo = new InMemoryLayoutRepository();
    const layout = makeLayout();

    await repo.save(layout);

    expect(await repo.findById("layout-1")).toEqual(layout);
  });

  it("overwrites a layout saved with the same id", async () => {
    const repo = new InMemoryLayoutRepository();
    await repo.save(makeLayout({ name: "v1" }));
    await repo.save(makeLayout({ name: "v2" }));

    expect((await repo.findById("layout-1"))?.name).toBe("v2");
  });

  it("lists only layouts belonging to the given floorplan", async () => {
    const repo = new InMemoryLayoutRepository();
    await repo.save(makeLayout({ id: "a", floorplanId: "fp-1" }));
    await repo.save(makeLayout({ id: "b", floorplanId: "fp-1" }));
    await repo.save(makeLayout({ id: "c", floorplanId: "fp-2" }));

    const results = await repo.listByFloorplan("fp-1");

    expect(results.map((layout) => layout.id).sort()).toEqual(["a", "b"]);
  });
});
