-- The "photos" bucket is public, so getPublicUrl reads bypass RLS entirely;
-- this SELECT policy only let the anon key *list* every object, which the
-- security advisor flagged and which the app never needs.
drop policy if exists "photos anon select" on storage.objects;
