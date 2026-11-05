-- =====================================================================
-- Vilar - 04_storage.sql
-- Buckets publics en lecture ; upload/modif/suppression : admin seulement.
-- =====================================================================

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values
  ('products', 'products', true, 5242880, array['image/jpeg','image/png','image/webp']),
  ('landing',  'landing',  true, 5242880, array['image/jpeg','image/png','image/webp']),
  ('site',     'site',     true, 5242880, array['image/jpeg','image/png','image/webp','image/svg+xml'])
on conflict (id) do update
  set public = excluded.public,
      file_size_limit = excluded.file_size_limit,
      allowed_mime_types = excluded.allowed_mime_types;

create policy "vilar public read images" on storage.objects
  for select using (bucket_id in ('products','landing','site'));

create policy "vilar admin insert images" on storage.objects
  for insert to authenticated
  with check (bucket_id in ('products','landing','site') and public.is_admin());

create policy "vilar admin update images" on storage.objects
  for update to authenticated
  using (bucket_id in ('products','landing','site') and public.is_admin());

create policy "vilar admin delete images" on storage.objects
  for delete to authenticated
  using (bucket_id in ('products','landing','site') and public.is_admin());
