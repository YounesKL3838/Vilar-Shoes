-- =====================================================================
-- Vilar - 07_admin.sql  (Phase 4)
-- Statistiques du dashboard. Réservé aux admins (FORBIDDEN sinon).
-- =====================================================================

create or replace function public.admin_stats(p_from timestamptz default null,
                                               p_to   timestamptz default null)
returns jsonb
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  r jsonb;
begin
  if not public.is_admin() then
    raise exception 'FORBIDDEN';
  end if;

  select jsonb_build_object(
    'orders', count(*),
    'revenue_active',    coalesce(sum(total) filter (where status not in ('cancelled','returned')), 0),
    'revenue_delivered', coalesce(sum(total) filter (where status = 'delivered'), 0),
    'by_status', coalesce(
        (select jsonb_object_agg(s.status, s.c)
           from (select status, count(*) as c
                   from orders
                  where (p_from is null or created_at >= p_from)
                    and (p_to   is null or created_at <  p_to)
                  group by status) s), '{}'::jsonb),
    'top_products', coalesce(
        (select jsonb_agg(jsonb_build_object('name', t.product_name, 'qty', t.q) order by t.q desc)
           from (select oi.product_name, sum(oi.qty)::int as q
                   from order_items oi
                   join orders o on o.id = oi.order_id
                  where o.status not in ('cancelled','returned')
                    and (p_from is null or o.created_at >= p_from)
                    and (p_to   is null or o.created_at <  p_to)
                  group by oi.product_name
                  order by q desc
                  limit 5) t), '[]'::jsonb)
  )
  into r
  from orders
  where (p_from is null or created_at >= p_from)
    and (p_to   is null or created_at <  p_to);

  return r;
end;
$$;

revoke all on function public.admin_stats(timestamptz, timestamptz) from public, anon;
grant execute on function public.admin_stats(timestamptz, timestamptz) to authenticated;

-- is_admin() doit être appelable par la page de connexion (après login)
grant execute on function public.is_admin() to authenticated;
