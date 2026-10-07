-- Ticket confirmation emails: track whether each paid order has been emailed.
-- email_sent_at doubles as a claim, so the browser callback and the webhook
-- can't both send the email for the same order.
alter table public.ticket_orders
  add column email_sent_at timestamptz,
  add column email_error   text;
