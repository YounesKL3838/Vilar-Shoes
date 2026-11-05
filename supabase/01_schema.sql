-- =====================================================================
-- Vilar - 01_schema.sql
-- Ordre d'exécution : 01_schema -> 02_functions -> 03_policies
--                     -> 04_storage -> 05_seed
-- =====================================================================

create extension if not exists pgcrypto;

-- ---------- Admins ----------
create table public.admins (
  user_id    uuid primary key references auth.users(id) on delete cascade,
  created_at timestamptz not null default now()
);

-- ---------- Catalogue ----------
create table public.categories (
  id         uuid primary key default gen_random_uuid(),
  slug       text not null unique check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  name_ar    text not null,
  name_fr    text not null,
  image_url  text,
  sort_order int  not null default 0,
  is_active  boolean not null default true,
  created_at timestamptz not null default now()
);

create table public.products (
  id             uuid primary key default gen_random_uuid(),
  slug           text not null unique check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  name_ar        text not null,
  name_fr        text not null,
  description_ar text,
  description_fr text,
  price          numeric(10,2) not null check (price >= 0),
  sale_price     numeric(10,2) check (sale_price is null or (sale_price >= 0 and sale_price < price)),
  category_id    uuid references public.categories(id) on delete set null,
  is_active      boolean not null default true,
  is_featured    boolean not null default false,
  is_new         boolean not null default false,
  is_bestseller  boolean not null default false,
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now()
);
create index products_category_idx on public.products(category_id);
create index products_active_idx  on public.products(is_active);

create table public.product_images (
  id         uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products(id) on delete cascade,
  url        text not null,
  sort_order int  not null default 0
);
create index product_images_product_idx on public.product_images(product_id);

create table public.product_variants (
  id         uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products(id) on delete cascade,
  size       text not null,
  color_name text not null,
  color_hex  text check (color_hex is null or color_hex ~ '^#[0-9A-Fa-f]{6}$'),
  stock      int  not null default 0 check (stock >= 0),
  is_active  boolean not null default true,
  unique (product_id, size, color_name)
);
create index product_variants_product_idx on public.product_variants(product_id);

-- ---------- Livraison ----------
create table public.delivery_zones (
  wilaya_code smallint primary key,
  name_fr     text not null,
  name_ar     text,
  home_fee    numeric(10,2) not null default 0 check (home_fee >= 0),
  desk_fee    numeric(10,2) not null default 0 check (desk_fee >= 0),
  is_active   boolean not null default false
);

-- ---------- Landing pages ----------
create table public.landing_pages (
  id             uuid primary key default gen_random_uuid(),
  slug           text not null unique check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  title          text not null,
  headline       text not null,
  subheadline    text,
  lang           text not null default 'ar' check (lang in ('ar','fr')),
  hero_image_url text,
  description    text,
  features       jsonb not null default '[]'::jsonb,
  gallery        jsonb not null default '[]'::jsonb,
  testimonials   jsonb not null default '[]'::jsonb,
  cta_text       text not null default 'Commander maintenant',
  offer_ends_at  timestamptz,
  is_published   boolean not null default false,
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now()
);

create table public.landing_page_products (
  landing_page_id uuid not null references public.landing_pages(id) on delete cascade,
  product_id      uuid not null references public.products(id) on delete cascade,
  offer_price     numeric(10,2) check (offer_price is null or offer_price >= 0),
  sort_order      int not null default 0,
  primary key (landing_page_id, product_id)
);

create table public.page_views (
  id              bigint generated always as identity primary key,
  landing_page_id uuid not null references public.landing_pages(id) on delete cascade,
  session_id      text not null,
  utm             jsonb,
  created_at      timestamptz not null default now()
);
create index page_views_lp_idx on public.page_views(landing_page_id, created_at);

-- ---------- Commandes ----------
create sequence public.order_number_seq start 1001;

create table public.orders (
  id              uuid primary key default gen_random_uuid(),
  order_number    text not null unique,
  idempotency_key text unique,
  customer_name   text not null,
  phone           text not null,
  wilaya_code     smallint not null references public.delivery_zones(wilaya_code),
  wilaya_name     text not null,
  commune         text not null,
  address         text not null,
  notes           text,
  delivery_type   text not null default 'home' check (delivery_type in ('home','desk')),
  subtotal        numeric(10,2) not null check (subtotal >= 0),
  delivery_fee    numeric(10,2) not null check (delivery_fee >= 0),
  total           numeric(10,2) not null check (total >= 0),
  status          text not null default 'new'
                  check (status in ('new','pending_confirmation','confirmed','preparing',
                                    'shipped','delivered','cancelled','returned')),
  source          text not null default 'home',
  landing_page_id uuid references public.landing_pages(id) on delete set null,
  utm             jsonb,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);
create index orders_status_idx  on public.orders(status);
create index orders_phone_idx   on public.orders(phone);
create index orders_created_idx on public.orders(created_at desc);
create index orders_lp_idx      on public.orders(landing_page_id);

create table public.order_items (
  id           uuid primary key default gen_random_uuid(),
  order_id     uuid not null references public.orders(id) on delete cascade,
  product_id   uuid references public.products(id) on delete set null,
  variant_id   uuid references public.product_variants(id) on delete set null,
  product_name text not null,
  size         text not null,
  color_name   text not null,
  qty          int  not null check (qty between 1 and 10),
  unit_price   numeric(10,2) not null check (unit_price >= 0)
);
create index order_items_order_idx on public.order_items(order_id);

create table public.order_status_history (
  id         bigint generated always as identity primary key,
  order_id   uuid not null references public.orders(id) on delete cascade,
  status     text not null,
  changed_by uuid,
  changed_at timestamptz not null default now()
);
create index order_history_order_idx on public.order_status_history(order_id);

-- ---------- Contenu ----------
create table public.reviews (
  id         uuid primary key default gen_random_uuid(),
  author     text not null,
  rating     int  not null check (rating between 1 and 5),
  body       text not null,
  product_id uuid references public.products(id) on delete set null,
  is_visible boolean not null default true,
  created_at timestamptz not null default now()
);

create table public.site_settings (
  key        text primary key,
  value      jsonb not null,
  updated_at timestamptz not null default now()
);
-- ATTENTION : site_settings est lisible publiquement. Aucun secret ici.

-- ---------- Stats landing pages (visible admin uniquement via RLS) ----------
create view public.landing_page_stats
with (security_invoker = on) as
select
  lp.id,
  lp.slug,
  lp.title,
  lp.is_published,
  (select count(*) from public.page_views v where v.landing_page_id = lp.id)::int as views,
  (select count(*) from public.orders o where o.landing_page_id = lp.id)::int     as orders,
  case
    when (select count(*) from public.page_views v where v.landing_page_id = lp.id) = 0 then 0
    else round(
      100.0 * (select count(*) from public.orders o where o.landing_page_id = lp.id)
            / (select count(*) from public.page_views v where v.landing_page_id = lp.id), 2)
  end as conversion_rate
from public.landing_pages lp;
