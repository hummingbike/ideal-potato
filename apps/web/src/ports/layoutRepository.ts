import type { Layout } from "../domain/types";

/**
 * Abstraction over wherever layouts are persisted. The real implementation
 * (Supabase Postgres) isn't wired up yet — see PLAN.md Phase 2.
 */
export interface LayoutRepositoryPort {
  save(layout: Layout): Promise<void>;
  findById(id: string): Promise<Layout | undefined>;
  listByFloorplan(floorplanId: string): Promise<Layout[]>;
}

/** In-memory stand-in for LayoutRepositoryPort, used until a real backend is wired in. */
export class InMemoryLayoutRepository implements LayoutRepositoryPort {
  private readonly layouts = new Map<string, Layout>();

  async save(layout: Layout): Promise<void> {
    this.layouts.set(layout.id, layout);
  }

  async findById(id: string): Promise<Layout | undefined> {
    return this.layouts.get(id);
  }

  async listByFloorplan(floorplanId: string): Promise<Layout[]> {
    return Array.from(this.layouts.values()).filter((layout) => layout.floorplanId === floorplanId);
  }
}
