// Shared helpers for the raffle Edge Functions.
import { createClient } from "npm:@supabase/supabase-js@2.45.4";

export const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

export class HttpError extends Error {
  constructor(public status: number, message: string) {
    super(message);
  }
}

export function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

export function errorResponse(err: unknown) {
  if (err instanceof HttpError) return json({ error: err.message }, err.status);
  console.error(err);
  return json({ error: "Something went wrong. Please try again." }, 500);
}

// Service-role client: bypasses RLS, so it only ever lives server-side.
export const db = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
  { auth: { persistSession: false } },
);

// Asks Flutterwave directly whether a transaction succeeded, then issues the
// tickets. Never trust the browser's word that a payment went through.
export async function verifyAndIssueTickets(transactionId: string | number, expectedTxRef?: string) {
  const res = await fetch(
    `https://api.flutterwave.com/v3/transactions/${encodeURIComponent(String(transactionId))}/verify`,
    { headers: { Authorization: `Bearer ${Deno.env.get("FLW_SECRET_KEY")}` } },
  );
  const body = await res.json().catch(() => null);
  const tx = body?.data;

  if (!res.ok || body?.status !== "success" || !tx) {
    throw new HttpError(402, "We couldn't verify this payment with Flutterwave.");
  }
  if (tx.status !== "successful") {
    throw new HttpError(402, `Payment was not successful (status: ${tx.status}).`);
  }
  if (tx.currency !== "NGN") {
    throw new HttpError(402, "Payment was not made in Naira.");
  }
  if (expectedTxRef && tx.tx_ref !== expectedTxRef) {
    throw new HttpError(400, "Payment reference does not match this order.");
  }

  const { data, error } = await db.rpc("confirm_ticket_order", {
    p_tx_ref: tx.tx_ref,
    p_flw_transaction_id: tx.id,
    p_amount_paid: tx.amount,
  });
  if (error) {
    console.error("confirm_ticket_order failed", tx.tx_ref, error);
    throw new HttpError(409, "Your payment was received but we couldn't issue tickets. Please contact us with your payment reference.");
  }

  return {
    tx_ref: tx.tx_ref as string,
    tickets: (data as { ticket_code: string }[]).map((r) => r.ticket_code),
  };
}
