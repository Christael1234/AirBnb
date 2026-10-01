-- Raffle ticket sales: orders, serialised tickets, and admin-only read access.
--
-- Writes never come from the browser. The Edge Functions in supabase/functions
-- use the service role to create orders and, once Flutterwave confirms a
-- payment, to issue tickets through confirm_ticket_order(). Signed-in admins
-- can read everything; nobody else can read or write anything.

-- ---------- ADMINS ----------
create table public.admins (
  user_id    uuid primary key references auth.users (id) on delete cascade,
  created_at timestamptz not null default now()
);
alter table public.admins enable row level security;
-- No policies: only the service role and is_admin() (security definer) read it.

create function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (select 1 from public.admins where user_id = auth.uid());
$$;
revoke execute on function public.is_admin() from public, anon;
grant execute on function public.is_admin() to authenticated;

-- ---------- ORDERS ----------
create table public.ticket_orders (
  id                 uuid primary key default gen_random_uuid(),
  tx_ref             text not null unique,
  flw_transaction_id bigint unique,
  buyer_name         text not null check (char_length(buyer_name) between 1 and 200),
  buyer_email        text not null check (char_length(buyer_email) between 3 and 320),
  buyer_phone        text not null check (char_length(buyer_phone) between 5 and 30),
  quantity           integer not null check (quantity between 1 and 1000),
  amount_ngn         integer not null check (amount_ngn = quantity * 1000),
  amount_paid_ngn    numeric(12, 2),
  status             text not null default 'pending' check (status in ('pending', 'paid')),
  created_at         timestamptz not null default now(),
  paid_at            timestamptz
);
create index ticket_orders_status_created_idx on public.ticket_orders (status, created_at desc);
create index ticket_orders_paid_at_idx on public.ticket_orders (paid_at) where status = 'paid';

alter table public.ticket_orders enable row level security;
create policy "Admins can read orders"
  on public.ticket_orders for select
  to authenticated
  using ((select public.is_admin()));

-- ---------- TICKETS ----------
-- One row per ticket. The serial comes from a sequence, so every ticket ever
-- issued has a unique, increasing number (T&Cs clause 5: serialised + timestamped).
create table public.tickets (
  serial      bigint generated always as identity primary key,
  ticket_code text generated always as ('RMC-' || lpad(serial::text, 7, '0')) stored unique,
  order_id    uuid not null references public.ticket_orders (id) on delete restrict,
  created_at  timestamptz not null default now()
);
create index tickets_order_id_idx on public.tickets (order_id);

alter table public.tickets enable row level security;
create policy "Admins can read tickets"
  on public.tickets for select
  to authenticated
  using ((select public.is_admin()));

revoke all on public.admins, public.ticket_orders, public.tickets from anon;

-- ---------- ISSUE TICKETS ----------
-- Called by the Edge Functions after Flutterwave has verified the payment.
-- Idempotent: the browser callback and the webhook can both call it for the
-- same order, and the second call just returns the tickets already issued.
create function public.confirm_ticket_order(
  p_tx_ref             text,
  p_flw_transaction_id bigint,
  p_amount_paid        numeric
)
returns table (ticket_code text)
language plpgsql
security definer
set search_path = public
as $$
declare
  o public.ticket_orders%rowtype;
  sold bigint;
begin
  select * into o from public.ticket_orders where tx_ref = p_tx_ref for update;
  if not found then
    raise exception 'Unknown order %', p_tx_ref;
  end if;

  if o.status = 'paid' then
    return query select t.ticket_code from public.tickets t where t.order_id = o.id order by t.serial;
    return;
  end if;

  if p_amount_paid < o.amount_ngn then
    raise exception 'Amount paid (%) is less than the order total (%)', p_amount_paid, o.amount_ngn;
  end if;

  select coalesce(sum(quantity), 0) into sold from public.ticket_orders where status = 'paid';
  if sold + o.quantity > 1000000 then
    raise exception 'Not enough tickets left for this order';
  end if;

  update public.ticket_orders
     set status = 'paid',
         flw_transaction_id = p_flw_transaction_id,
         amount_paid_ngn = p_amount_paid,
         paid_at = now()
   where id = o.id;

  insert into public.tickets (order_id)
  select o.id from generate_series(1, o.quantity);

  return query select t.ticket_code from public.tickets t where t.order_id = o.id order by t.serial;
end;
$$;
revoke execute on function public.confirm_ticket_order(text, bigint, numeric) from public, anon, authenticated;
grant execute on function public.confirm_ticket_order(text, bigint, numeric) to service_role;

-- ---------- DASHBOARD VIEWS ----------
-- security_invoker makes the views respect the RLS policies above, so they
-- return nothing to anyone who isn't an admin.
create view public.raffle_summary with (security_invoker = true) as
select
  coalesce(sum(quantity) filter (where status = 'paid'), 0)::bigint           as tickets_sold,
  1000000 - coalesce(sum(quantity) filter (where status = 'paid'), 0)::bigint as tickets_remaining,
  coalesce(sum(amount_paid_ngn) filter (where status = 'paid'), 0)            as revenue_ngn,
  count(*) filter (where status = 'paid')                                     as paid_orders,
  count(distinct lower(buyer_email)) filter (where status = 'paid')           as unique_buyers,
  count(*) filter (where status = 'pending')                                  as pending_orders
from public.ticket_orders;

create view public.raffle_daily_sales with (security_invoker = true) as
select
  (paid_at at time zone 'Africa/Lagos')::date as sale_date,
  count(*)                                    as orders,
  sum(quantity)::bigint                       as tickets,
  sum(amount_paid_ngn)                        as revenue_ngn
from public.ticket_orders
where status = 'paid'
group by 1;

revoke all on public.raffle_summary, public.raffle_daily_sales from anon;

-- Explicit read grants for signed-in users; RLS above still limits rows to admins.
grant select on public.ticket_orders, public.tickets, public.raffle_summary, public.raffle_daily_sales to authenticated;
