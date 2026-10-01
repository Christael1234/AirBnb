-- Simulated payments for testing without Flutterwave keys.
-- Orders paid through the simulate-ticket-payment function are flagged so the
-- dashboard can label them and they can be deleted before going live.

alter table public.ticket_orders add column simulated boolean not null default false;

-- Same columns as before plus test_orders at the end (create or replace can only append).
create or replace view public.raffle_summary with (security_invoker = true) as
select
  coalesce(sum(quantity) filter (where status = 'paid'), 0)::bigint           as tickets_sold,
  1000000 - coalesce(sum(quantity) filter (where status = 'paid'), 0)::bigint as tickets_remaining,
  coalesce(sum(amount_paid_ngn) filter (where status = 'paid'), 0)            as revenue_ngn,
  count(*) filter (where status = 'paid')                                     as paid_orders,
  count(distinct lower(buyer_email)) filter (where status = 'paid')           as unique_buyers,
  count(*) filter (where status = 'pending')                                  as pending_orders,
  count(*) filter (where status = 'paid' and simulated)                       as test_orders
from public.ticket_orders;
