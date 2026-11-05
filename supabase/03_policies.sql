-- =====================================================================
-- Vilar - 03_policies.sql  (Row Level Security)
-- Principe : les visiteurs (anon) lisent uniquement le contenu publié.
-- Ils ne peuvent RIEN écrire directement : les commandes passent par
-- create_order() et les visites par track_view().
-- =====================================================================

alter table public.admins                enable row level security;
alter table public.categories            enable row level security;
alter table public.products              enable row level security;
alter table public.product_images        enable row level security;
alter table public.product_variants      enable row level security;
alter table public.delivery_zones        enable row level security;
alter table public.landing_pages         enable row level security;
alter table public.landing_page_products enable row level security;
alter table public.page_views            enable row level security;
alter table public.orders                enable row level security;
alter table public.order_items           enable row level security;
alter table public.order_status_history  enable row level security;
alter table public.reviews               enable row level security;
alter table public.site_settings         enable row level security;

-- Sécurité en profondeur : retirer les droits directs sur les tables sensibles
revoke all on public.admins, public.orders, public.order_items,
              public.order_status_history, public.page_views
  from anon, authenticated;
grant select, insert, update, delete on
  public.orders, public.order_items, public.order_status_history,
  public.page_views, public.admins
  to authenticated;   -- limité ensuite par RLS (admin uniquement)

revoke insert, update, delete on
  public.categories, public.products, public.product_images,
  public.product_variants, public.delivery_zones, public.landing_pages,
  public.landing_page_products, public.reviews, public.site_settings
  from anon;

-- ---------- Lecture publique (contenu actif/publié) ----------
create policy "public read categories" on public.categories
  for select using (is_active);

create policy "public read products" on public.products
  for select using (is_active);

create policy "public read product_images" on public.product_images
  for select using (exists (select 1 from public.products p
                             where p.id = product_id and p.is_active));

create policy "public read variants" on public.product_variants
  for select using (is_active and exists (select 1 from public.products p
                                           where p.id = product_id and p.is_active));

create policy "public read delivery_zones" on public.delivery_zones
  for select using (is_active);

create policy "public read landing_pages" on public.landing_pages
  for select using (is_published);

create policy "public read landing_page_products" on public.landing_page_products
  for select using (exists (select 1 from public.landing_pages lp
                             where lp.id = landing_page_id and lp.is_published));

create policy "public read reviews" on public.reviews
  for select using (is_visible);

create policy "public read settings" on public.site_settings
  for select using (true);

-- ---------- Admin : accès complet ----------
create policy "admin all admins"       on public.admins
  for all using (public.is_admin()) with check (public.is_admin());
create policy "admin all categories"   on public.categories
  for all using (public.is_admin()) with check (public.is_admin());
create policy "admin all products"     on public.products
  for all using (public.is_admin()) with check (public.is_admin());
create policy "admin all images"       on public.product_images
  for all using (public.is_admin()) with check (public.is_admin());
create policy "admin all variants"     on public.product_variants
  for all using (public.is_admin()) with check (public.is_admin());
create policy "admin all zones"        on public.delivery_zones
  for all using (public.is_admin()) with check (public.is_admin());
create policy "admin all landing"      on public.landing_pages
  for all using (public.is_admin()) with check (public.is_admin());
create policy "admin all lp_products"  on public.landing_page_products
  for all using (public.is_admin()) with check (public.is_admin());
create policy "admin all views"        on public.page_views
  for all using (public.is_admin()) with check (public.is_admin());
create policy "admin all orders"       on public.orders
  for all using (public.is_admin()) with check (public.is_admin());
create policy "admin all order_items"  on public.order_items
  for all using (public.is_admin()) with check (public.is_admin());
create policy "admin all history"      on public.order_status_history
  for all using (public.is_admin()) with check (public.is_admin());
create policy "admin all reviews"      on public.reviews
  for all using (public.is_admin()) with check (public.is_admin());
create policy "admin all settings"     on public.site_settings
  for all using (public.is_admin()) with check (public.is_admin());

-- Les visiteurs n'ont AUCUNE policy sur orders, order_items,
-- order_status_history, page_views, admins => accès refusé.
