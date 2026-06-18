insert into storage.buckets (id, name, public)
values ('photos', 'photos', true)
on conflict (id) do nothing;

-- Single-user personal project (PRD.md 3절/7절) — anon key gets full access to this bucket.
create policy "photos anon select" on storage.objects for select to anon using (bucket_id = 'photos');
create policy "photos anon insert" on storage.objects for insert to anon with check (bucket_id = 'photos');
create policy "photos anon update" on storage.objects for update to anon using (bucket_id = 'photos');
create policy "photos anon delete" on storage.objects for delete to anon using (bucket_id = 'photos');
