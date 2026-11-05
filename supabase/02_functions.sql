-- =====================================================================
-- Vilar - 02_functions.sql
-- =====================================================================

-- ---------- is_admin ----------
create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (select 1 from public.admins where user_id = auth.uid());
$$;

-- ---------- updated_at ----------
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger products_updated_at       before update on public.products
  for each row execute function public.set_updated_at();
create trigger landing_pages_updated_at  before update on public.landing_pages
  for each row execute function public.set_updated_at();
create trigger orders_updated_at         before update on public.orders
  for each row execute function public.set_updated_at();
create trigger site_settings_updated_at  before update on public.site_settings
  for each row execute function public.set_updated_at();

-- ---------- Normalisation du téléphone algérien ----------
create or replace function public.normalize_dz_phone(p text)
returns text
language plpgsql
immutable
as $$
declare s text;
begin
  s := regexp_replace(coalesce(p, ''), '[\s\.\-\(\)]', '', 'g');
  if s like '+213%'  then s := '0' || substr(s, 5);
  elsif s like '00213%' then s := '0' || substr(s, 6);
  elsif s like '213%'   then s := '0' || substr(s, 4);
  end if;
  return s;
end;
$$;

-- ---------- Historique des statuts + gestion du stock ----------
create or replace function public.orders_status_trigger()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  was_closed boolean;
  is_closed  boolean;
begin
  if tg_op = 'INSERT' then
    insert into order_status_history(order_id, status, changed_by)
    values (new.id, new.status, auth.uid());
    return new;
  end if;

  if new.status is distinct from old.status then
    insert into order_status_history(order_id, status, changed_by)
    values (new.id, new.status, auth.uid());

    was_closed := old.status in ('cancelled','returned');
    is_closed  := new.status in ('cancelled','returned');

    if is_closed and not was_closed then
      -- annulation / retour : on remet le stock
      update product_variants v
         set stock = v.stock + oi.qty
        from order_items oi
       where oi.order_id = new.id and oi.variant_id = v.id;
    elsif was_closed and not is_closed then
      -- réactivation : on redéduit (la contrainte stock >= 0 protège)
      update product_variants v
         set stock = v.stock - oi.qty
        from order_items oi
       where oi.order_id = new.id and oi.variant_id = v.id;
    end if;
  end if;
  return new;
end;
$$;

create trigger orders_status_ins after insert on public.orders
  for each row execute function public.orders_status_trigger();
create trigger orders_status_upd after update of status on public.orders
  for each row execute function public.orders_status_trigger();

-- ---------- create_order ----------
-- Seul point d'entrée public pour créer une commande.
-- Les prix sont TOUJOURS recalculés ici depuis la base.
--
-- Exemple de paramètre p :
-- {
--   "idempotency_key": "uuid-généré-côté-client",
--   "name": "Amina B.", "phone": "0555123456",
--   "wilaya_code": 9, "commune": "Blida", "address": "...",
--   "notes": "", "delivery_type": "home",
--   "source": "home" | "landing", "landing_slug": "slug",
--   "utm": {...},
--   "items": [{"variant_id": "uuid", "qty": 1}]
-- }
create or replace function public.create_order(p jsonb)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_key       text := nullif(trim(p->>'idempotency_key'), '');
  v_name      text := trim(coalesce(p->>'name', ''));
  v_phone     text := public.normalize_dz_phone(p->>'phone');
  v_commune   text := trim(coalesce(p->>'commune', ''));
  v_address   text := trim(coalesce(p->>'address', ''));
  v_notes     text := nullif(trim(coalesce(p->>'notes', '')), '');
  v_dtype     text := coalesce(nullif(p->>'delivery_type', ''), 'home');
  v_wcode     smallint;
  v_zone      delivery_zones%rowtype;
  v_lp        landing_pages%rowtype;
  v_source    text := 'home';
  v_items     jsonb := p->'items';
  v_item      jsonb;
  v_var       record;
  v_qty       int;
  v_price     numeric(10,2);
  v_offer     numeric(10,2);
  v_subtotal  numeric(10,2) := 0;
  v_fee       numeric(10,2);
  v_order_id  uuid;
  v_number    text;
  v_existing  orders%rowtype;
  v_lines     jsonb := '[]'::jsonb;
begin
  -- 1) Idempotence : même clé => même commande
  if v_key is not null then
    select * into v_existing from orders where idempotency_key = v_key;
    if found then
      return jsonb_build_object('order_number', v_existing.order_number,
                                'total', v_existing.total, 'duplicate', true);
    end if;
  end if;

  -- 2) Validation des champs
  if char_length(v_name) < 2 or char_length(v_name) > 100 then
    raise exception 'INVALID_NAME';
  end if;
  if v_phone !~ '^0[567][0-9]{8}$' then
    raise exception 'INVALID_PHONE';
  end if;
  if char_length(v_commune) < 2 or char_length(v_commune) > 100 then
    raise exception 'INVALID_COMMUNE';
  end if;
  if char_length(v_address) < 5 or char_length(v_address) > 300 then
    raise exception 'INVALID_ADDRESS';
  end if;
  if v_notes is not null and char_length(v_notes) > 500 then
    raise exception 'INVALID_NOTES';
  end if;
  if v_dtype not in ('home','desk') then
    raise exception 'INVALID_DELIVERY_TYPE';
  end if;
  if jsonb_typeof(v_items) is distinct from 'array'
     or jsonb_array_length(v_items) not between 1 and 10 then
    raise exception 'INVALID_ITEMS';
  end if;

  begin
    v_wcode := (p->>'wilaya_code')::smallint;
  exception when others then
    raise exception 'INVALID_WILAYA';
  end;
  select * into v_zone from delivery_zones where wilaya_code = v_wcode and is_active;
  if not found then raise exception 'INVALID_WILAYA'; end if;

  -- 3) Limite : 5 commandes / heure / téléphone
  if (select count(*) from orders
       where phone = v_phone and created_at > now() - interval '1 hour') >= 5 then
    raise exception 'TOO_MANY_ORDERS';
  end if;

  -- 4) Landing page (facultative)
  if nullif(p->>'landing_slug', '') is not null then
    select * into v_lp from landing_pages
     where slug = p->>'landing_slug' and is_published;
    if found then
      v_source := 'landing:' || v_lp.slug;
    end if;
  end if;

  -- 5) Anti-doublon : même téléphone + même variante dans les 10 dernières minutes
  select o.* into v_existing
    from orders o
    join order_items oi on oi.order_id = o.id
   where o.phone = v_phone
     and o.created_at > now() - interval '10 minutes'
     and oi.variant_id in (select (i->>'variant_id')::uuid from jsonb_array_elements(v_items) i)
   limit 1;
  if found then
    return jsonb_build_object('order_number', v_existing.order_number,
                              'total', v_existing.total, 'duplicate', true);
  end if;

  -- 6) Lignes : verrouillage, prix serveur, vérification du stock
  for v_item in select * from jsonb_array_elements(v_items) loop
    v_qty := coalesce((v_item->>'qty')::int, 0);
    if v_qty < 1 or v_qty > 10 then raise exception 'INVALID_QTY'; end if;

    select pv.id as variant_id, pv.size, pv.color_name, pv.stock,
           pr.id as product_id, pr.name_fr, pr.price, pr.sale_price
      into v_var
      from product_variants pv
      join products pr on pr.id = pv.product_id
     where pv.id = (v_item->>'variant_id')::uuid
       and pv.is_active and pr.is_active
     for update of pv;

    if not found then raise exception 'VARIANT_NOT_FOUND'; end if;
    if v_var.stock < v_qty then raise exception 'OUT_OF_STOCK'; end if;

    v_price := coalesce(v_var.sale_price, v_var.price);

    -- Prix d'offre landing (seulement si l'offre n'est pas expirée)
    if v_lp.id is not null
       and (v_lp.offer_ends_at is null or v_lp.offer_ends_at > now()) then
      select offer_price into v_offer
        from landing_page_products
       where landing_page_id = v_lp.id and product_id = v_var.product_id;
      if v_offer is not null then v_price := v_offer; end if;
    end if;

    v_subtotal := v_subtotal + v_price * v_qty;
    v_lines := v_lines || jsonb_build_object(
      'product_id', v_var.product_id, 'variant_id', v_var.variant_id,
      'name', v_var.name_fr, 'size', v_var.size, 'color', v_var.color_name,
      'qty', v_qty, 'price', v_price);
  end loop;

  -- 7) Livraison + total
  v_fee := case v_dtype when 'home' then v_zone.home_fee else v_zone.desk_fee end;
  v_number := 'VL-' || nextval('public.order_number_seq');

  insert into orders(order_number, idempotency_key, customer_name, phone,
                     wilaya_code, wilaya_name, commune, address, notes,
                     delivery_type, subtotal, delivery_fee, total,
                     source, landing_page_id, utm)
  values (v_number, v_key, v_name, v_phone,
          v_zone.wilaya_code, v_zone.name_fr, v_commune, v_address, v_notes,
          v_dtype, v_subtotal, v_fee, v_subtotal + v_fee,
          v_source, v_lp.id, p->'utm')
  returning id into v_order_id;

  -- 8) Lignes de commande + décrémentation du stock
  for v_item in select * from jsonb_array_elements(v_lines) loop
    insert into order_items(order_id, product_id, variant_id, product_name,
                            size, color_name, qty, unit_price)
    values (v_order_id, (v_item->>'product_id')::uuid, (v_item->>'variant_id')::uuid,
            v_item->>'name', v_item->>'size', v_item->>'color',
            (v_item->>'qty')::int, (v_item->>'price')::numeric);

    update product_variants
       set stock = stock - (v_item->>'qty')::int
     where id = (v_item->>'variant_id')::uuid;
  end loop;

  return jsonb_build_object('order_number', v_number,
                            'total', v_subtotal + v_fee, 'duplicate', false);
end;
$$;

revoke all on function public.create_order(jsonb) from public;
grant execute on function public.create_order(jsonb) to anon, authenticated;

-- ---------- track_view : comptage des visites d'une landing page ----------
create or replace function public.track_view(p_slug text, p_session text, p_utm jsonb default null)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare v_id uuid;
begin
  if p_session is null or char_length(p_session) not between 8 and 64 then
    return;
  end if;
  select id into v_id from landing_pages where slug = p_slug and is_published;
  if v_id is null then return; end if;
  -- une visite par session et par page toutes les 30 minutes
  if exists (select 1 from page_views
              where landing_page_id = v_id and session_id = p_session
                and created_at > now() - interval '30 minutes') then
    return;
  end if;
  insert into page_views(landing_page_id, session_id, utm) values (v_id, p_session, p_utm);
end;
$$;

revoke all on function public.track_view(text, text, jsonb) from public;
grant execute on function public.track_view(text, text, jsonb) to anon, authenticated;
