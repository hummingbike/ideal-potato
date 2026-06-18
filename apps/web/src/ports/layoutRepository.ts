import type { SupabaseClient } from "@supabase/supabase-js";
import type { Layout, LayoutPlacement } from "../domain/types";

/**
 * Abstraction over wherever layouts are persisted. `SupabaseLayoutRepository`
 * is the real implementation (Supabase Postgres); `InMemoryLayoutRepository`
 * stands in for local dev/tests without a Supabase project.
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

interface LayoutRow {
  id: string;
  floorplan_id: string;
  name: string;
  created_at: string;
}

interface LayoutPlacementRow {
  layout_id: string;
  item_id: string;
  row: number;
  col: number;
}

function toPlacement(row: LayoutPlacementRow): LayoutPlacement {
  return { itemId: row.item_id, row: row.row, col: row.col };
}

function toLayout(row: LayoutRow, placementRows: LayoutPlacementRow[]): Layout {
  return {
    id: row.id,
    floorplanId: row.floorplan_id,
    name: row.name,
    createdAt: row.created_at,
    placements: placementRows.map(toPlacement),
  };
}

/** Persists layouts to the `layouts`/`layout_placements` tables (PRD.md 8절 데이터 모델). */
export class SupabaseLayoutRepository implements LayoutRepositoryPort {
  constructor(private readonly client: SupabaseClient) {}

  async save(layout: Layout): Promise<void> {
    const { error: layoutError } = await this.client.from("layouts").upsert({
      id: layout.id,
      floorplan_id: layout.floorplanId,
      name: layout.name,
      created_at: layout.createdAt,
    });
    if (layoutError) throw layoutError;

    const { error: deleteError } = await this.client.from("layout_placements").delete().eq("layout_id", layout.id);
    if (deleteError) throw deleteError;

    if (layout.placements.length === 0) return;

    const { error: insertError } = await this.client.from("layout_placements").insert(
      layout.placements.map((placement) => ({
        layout_id: layout.id,
        item_id: placement.itemId,
        row: placement.row,
        col: placement.col,
      })),
    );
    if (insertError) throw insertError;
  }

  async findById(id: string): Promise<Layout | undefined> {
    const { data: layoutRow, error } = await this.client.from("layouts").select("*").eq("id", id).maybeSingle();
    if (error) throw error;
    if (!layoutRow) return undefined;

    const { data: placementRows, error: placementsError } = await this.client
      .from("layout_placements")
      .select("*")
      .eq("layout_id", id);
    if (placementsError) throw placementsError;

    return toLayout(layoutRow as LayoutRow, (placementRows ?? []) as LayoutPlacementRow[]);
  }

  async listByFloorplan(floorplanId: string): Promise<Layout[]> {
    const { data: layoutRows, error } = await this.client.from("layouts").select("*").eq("floorplan_id", floorplanId);
    if (error) throw error;
    if (!layoutRows || layoutRows.length === 0) return [];

    const ids = (layoutRows as LayoutRow[]).map((row) => row.id);
    const { data: placementRows, error: placementsError } = await this.client
      .from("layout_placements")
      .select("*")
      .in("layout_id", ids);
    if (placementsError) throw placementsError;

    return (layoutRows as LayoutRow[]).map((row) =>
      toLayout(
        row,
        ((placementRows ?? []) as LayoutPlacementRow[]).filter((placement) => placement.layout_id === row.id),
      ),
    );
  }
}
