-- =====================================================================
-- Vilar - 06_newsletter.sql  (Phase 2)
-- Inscriptions newsletter : les visiteurs peuvent seulement INSÉRER.
-- Ils ne peuvent pas lire la liste. L'admin la gère.
-- =====================================================================

create table public.newsletter_subscribers (
  id         uuid primary key default gen_random_uuid(),
  email      text not null unique
             check (char_length(email) <= 254 and email ~* '^[^@\s]+@[^@\s]+\.[^@\s]+$'),
  created_at timestamptz not null default now()
);

alter table public.newsletter_subscribers enable row level security;

revoke all on public.newsletter_subscribers from anon, authenticated;
grant insert on public.newsletter_subscribers to anon, authenticated;
grant select, update, delete on public.newsletter_subscribers to authenticated;

create policy "public subscribe" on public.newsletter_subscribers
  for insert to anon, authenticated with check (true);

create policy "admin manage subscribers" on public.newsletter_subscribers
  for all to authenticated
  using (public.is_admin()) with check (public.is_admin());

-- Réglage du hero (modifiable plus tard depuis l'admin)
insert into public.site_settings (key, value) values
  ('hero', '{"image_url":"","title_ar":"","title_fr":"","subtitle_ar":"","subtitle_fr":""}')
on conflict (key) do nothing;
