create table floorplans (
  id text primary key,
  name text not null,
  width_meters numeric not null,
  height_meters numeric not null,
  created_at timestamptz not null default now()
);

create table grids (
  floorplan_id text primary key references floorplans (id) on delete cascade,
  rows integer not null,
  cols integer not null,
  cell_size_meters numeric not null
);

create table cells (
  grid_floorplan_id text not null references grids (floorplan_id) on delete cascade,
  row integer not null,
  col integer not null,
  photo_url text,
  primary key (grid_floorplan_id, row, col)
);

create table furniture_items (
  id text primary key,
  floorplan_id text not null references floorplans (id) on delete cascade,
  name text not null,
  category text not null,
  size_w integer not null,
  size_h integer not null,
  original_image_url text not null,
  segmented_image_url text,
  icon_image_url text,
  bounding_box jsonb,
  source_cell_row integer not null,
  source_cell_col integer not null,
  created_at timestamptz not null default now()
);

create table layouts (
  id text primary key,
  floorplan_id text not null references floorplans (id) on delete cascade,
  name text not null,
  created_at timestamptz not null default now()
);

create table layout_placements (
  layout_id text not null references layouts (id) on delete cascade,
  item_id text not null references furniture_items (id) on delete cascade,
  row integer not null,
  col integer not null,
  primary key (layout_id, item_id)
);

alter table floorplans enable row level security;
alter table grids enable row level security;
alter table cells enable row level security;
alter table furniture_items enable row level security;
alter table layouts enable row level security;
alter table layout_placements enable row level security;

-- Single-user personal project (PRD.md 3절/7절) — no auth/multi-tenant model yet,
-- so allow the anon/publishable key full access for now.
create policy "anon full access" on floorplans for all using (true) with check (true);
create policy "anon full access" on grids for all using (true) with check (true);
create policy "anon full access" on cells for all using (true) with check (true);
create policy "anon full access" on furniture_items for all using (true) with check (true);
create policy "anon full access" on layouts for all using (true) with check (true);
create policy "anon full access" on layout_placements for all using (true) with check (true);
