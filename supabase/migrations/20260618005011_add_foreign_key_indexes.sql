create index if not exists furniture_items_floorplan_id_idx on furniture_items (floorplan_id);
create index if not exists layouts_floorplan_id_idx on layouts (floorplan_id);
create index if not exists layout_placements_item_id_idx on layout_placements (item_id);
