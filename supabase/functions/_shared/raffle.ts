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

// Records why a payment couldn't be confirmed, so it shows on the dashboard.
async function recordVerifyError(txRef: string | undefined, message: string) {
  if (!txRef) return;
  await db.from("ticket_orders")
    .update({ verify_error: message.slice(0, 500), verify_checked_at: new Date().toISOString() })
    .eq("tx_ref", txRef)
    .eq("status", "pending");
}

// Asks Flutterwave directly whether a transaction succeeded, then issues the
// tickets. Never trust the browser's word that a payment went through.
// Looks the payment up by Flutterwave transaction ID when we have one, or by
// our own order reference (tx_ref) otherwise, e.g. when rechecking from the
// admin dashboard.
export async function verifyAndIssueTickets(transactionId: string | number | null | undefined, expectedTxRef?: string) {
  const url = transactionId
    ? `https://api.flutterwave.com/v3/transactions/${encodeURIComponent(String(transactionId))}/verify`
    : `https://api.flutterwave.com/v3/transactions/verify_by_reference?tx_ref=${encodeURIComponent(String(expectedTxRef))}`;
  const res = await fetch(url, { headers: { Authorization: `Bearer ${Deno.env.get("FLW_SECRET_KEY")}` } });
  const body = await res.json().catch(() => null);
  const tx = body?.data;

  if (!res.ok || body?.status !== "success" || !tx) {
    const reason = `Flutterwave ${res.status}: ${body?.message ?? "no response body"}`;
    console.error("flutterwave verify failed", expectedTxRef, transactionId, reason);
    await recordVerifyError(expectedTxRef, reason);
    throw new HttpError(402, "We couldn't verify this payment with Flutterwave.");
  }
  if (tx.status !== "successful") {
    await recordVerifyError(expectedTxRef, `Payment status: ${tx.status}`);
    throw new HttpError(402, `Payment was not successful (status: ${tx.status}).`);
  }
  if (tx.currency !== "NGN") {
    await recordVerifyError(expectedTxRef, `Currency: ${tx.currency}`);
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
    await recordVerifyError(tx.tx_ref, `Issuing tickets failed: ${error.message}`);
    throw new HttpError(409, "Your payment was received but we couldn't issue tickets. Please contact us with your payment reference.");
  }

  const tickets = (data as { ticket_code: string }[]).map((r) => r.ticket_code);
  await sendTicketEmail(tx.tx_ref, tickets);
  return { tx_ref: tx.tx_ref as string, tickets };
}

// ---------- TICKET EMAIL ----------
const escapeHtml = (s: unknown) =>
  String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);

// Emails the buyer their ticket codes, once per order. Never throws: a failed
// email must not fail a paid order. Failures are recorded in email_error and
// shown on the admin dashboard.
export async function sendTicketEmail(txRef: string, tickets: string[]) {
  const apiKey = Deno.env.get("BREVO_API_KEY");
  const fromEmail = Deno.env.get("EMAIL_FROM_ADDRESS");
  if (!apiKey || !fromEmail) {
    console.warn("BREVO_API_KEY or EMAIL_FROM_ADDRESS not set; skipping ticket email for", txRef);
    return;
  }

  // Claim the order atomically so only one caller sends the email.
  const { data: order, error: claimError } = await db.from("ticket_orders")
    .update({ email_sent_at: new Date().toISOString(), email_error: null })
    .eq("tx_ref", txRef)
    .eq("status", "paid")
    .is("email_sent_at", null)
    .select("buyer_name, buyer_email, quantity, amount_paid_ngn, paid_at, simulated")
    .maybeSingle();
  if (claimError) {
    console.error("claim ticket email failed", txRef, claimError);
    return;
  }
  if (!order) return; // already emailed (or not paid)

  const fromName = Deno.env.get("EMAIL_FROM_NAME") ?? "The Real Mc'Coy Raffle";
  const paidAt = new Date(order.paid_at).toLocaleString("en-NG", {
    timeZone: "Africa/Lagos", dateStyle: "medium", timeStyle: "short",
  });
  const amount = "₦" + Number(order.amount_paid_ngn).toLocaleString("en-NG");
  const test = order.simulated ? "[TEST] " : "";
  const plural = tickets.length === 1 ? "ticket" : "tickets";

  const codesHtml = tickets.map((c) =>
    `<span style="display:inline-block;margin:0 6px 8px 0;padding:6px 10px;border:1px solid #AD8A56;background:#EDEAE2;font-family:Menlo,Consolas,monospace;font-size:13px;">${escapeHtml(c)}</span>`
  ).join("");
  const row = (label: string, value: string) =>
    `<tr><td style="padding:10px 0;border-top:1px solid #DDD8CC;color:#6E655C;">${label}</td><td style="padding:10px 0;border-top:1px solid #DDD8CC;text-align:right;">${value}</td></tr>`;

  const html = `<!doctype html><html><body style="margin:0;background:#F6F4EF;">
<div style="max-width:560px;margin:0 auto;padding:32px 24px;font-family:Helvetica,Arial,sans-serif;color:#1A1A1A;line-height:1.55;">
  <p style="margin:0 0 6px;font-size:12px;letter-spacing:.08em;text-transform:uppercase;color:#8E6F3E;">10th Anniversary Promotional Raffle Draw</p>
  <h1 style="margin:0 0 18px;font-family:Georgia,serif;font-weight:normal;font-size:26px;">${order.simulated ? "Test tickets issued" : "Your tickets are confirmed"}</h1>
  ${order.simulated ? `<p style="padding:10px 12px;border:1px dashed #6E655C;font-size:13px;color:#6E655C;">This was a simulated test payment. No money was taken.</p>` : ""}
  <p>Hi ${escapeHtml(order.buyer_name)},</p>
  <p>Thank you for entering The Real Mc&rsquo;Coy Promotional Raffle Draw. Your payment was received and your ${tickets.length} ${plural} ${tickets.length === 1 ? "has" : "have"} been issued:</p>
  <div style="margin:18px 0 22px;">${codesHtml}</div>
  <table style="width:100%;border-collapse:collapse;font-size:14px;">
    ${row("Tickets", String(tickets.length))}
    ${row("Amount paid", amount)}
    ${row("Paid on", escapeHtml(paidAt))}
    ${row("Payment reference", escapeHtml(txRef))}
  </table>
  <p style="margin-top:24px;font-size:14px;"><strong>Keep this email.</strong> To claim a prize you&rsquo;ll need your ticket code and a valid government-issued ID. Prizes must be claimed within 180 days of the winners being announced.</p>
  <p style="font-size:14px;">Draws are held across the one-year draw period, supervised by an independent auditor and the FCT Lottery Regulatory Office (FCT-LRO). Draw dates are announced publicly in advance, and results are published within 24 hours.</p>
  <p style="font-size:14px;">Questions? Call +234 911 363 7444 or reply to therealmccoypartners@gmail.com, quoting your payment reference.</p>
  <p style="margin-top:28px;font-size:12px;color:#6E655C;">You must be 18 or older to participate. Tickets are non-refundable and non-transferable.</p>
</div></body></html>`;

  const text = [
    `Hi ${order.buyer_name},`,
    "",
    `Your ${tickets.length} ${plural} for The Real Mc'Coy Promotional Raffle Draw:`,
    tickets.join(", "),
    "",
    `Amount paid: ${amount}`,
    `Paid on: ${paidAt}`,
    `Payment reference: ${txRef}`,
    "",
    "Keep this email. To claim a prize you'll need your ticket code and a valid government-issued ID, within 180 days of the winners being announced.",
    "Questions? +234 911 363 7444 / therealmccoypartners@gmail.com",
  ].join("\n");

  try {
    // Brevo transactional email API: https://developers.brevo.com/reference/sendtransacemail
    const res = await fetch("https://api.brevo.com/v3/smtp/email", {
      method: "POST",
      headers: {
        "api-key": apiKey,
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({
        sender: { name: fromName, email: fromEmail },
        to: [{ email: order.buyer_email, name: order.buyer_name }],
        replyTo: { email: "therealmccoypartners@gmail.com", name: "The Real Mc'Coy Partners" },
        subject: `${test}Your raffle ${plural}: ${tickets.length === 1 ? tickets[0] : `${tickets.length} tickets`}`,
        htmlContent: html,
        textContent: text,
        tags: ["raffle-ticket"],
      }),
    });
    if (!res.ok) throw new Error(`Brevo ${res.status}: ${(await res.text()).slice(0, 300)}`);
  } catch (err) {
    console.error("ticket email failed", txRef, err);
    // Release the claim so it can be retried, and record why it failed.
    await db.from("ticket_orders")
      .update({ email_sent_at: null, email_error: String((err as Error).message ?? err).slice(0, 500) })
      .eq("tx_ref", txRef);
  }
}
