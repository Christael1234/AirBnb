-- Why a pending order's payment couldn't be confirmed (e.g. Flutterwave's
-- error message), shown on the admin dashboard.
alter table public.ticket_orders
  add column verify_error      text,
  add column verify_checked_at timestamptz;
