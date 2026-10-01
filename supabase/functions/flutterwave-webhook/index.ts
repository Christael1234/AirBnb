// Flutterwave webhook: issues tickets even if the buyer closed the page
// before the browser could call verify-ticket-payment.
// Configure in Flutterwave dashboard -> Settings -> Webhooks, with the same
// secret hash as the FLW_WEBHOOK_HASH secret.
import { errorResponse, HttpError, json, verifyAndIssueTickets } from "../_shared/raffle.ts";

Deno.serve(async (req) => {
  try {
    const expected = Deno.env.get("FLW_WEBHOOK_HASH");
    if (!expected || req.headers.get("verif-hash") !== expected) {
      throw new HttpError(401, "Invalid signature");
    }

    const payload = await req.json().catch(() => null);
    const tx = payload?.data;
    // Ignore anything that isn't a completed raffle payment (e.g. room bookings).
    if (payload?.event !== "charge.completed" || !tx?.id || !String(tx.tx_ref ?? "").startsWith("RAFFLE-")) {
      return json({ ignored: true });
    }

    // Re-verify with Flutterwave rather than trusting the webhook body.
    const result = await verifyAndIssueTickets(tx.id, tx.tx_ref);
    return json({ ok: true, tx_ref: result.tx_ref, tickets: result.tickets.length });
  } catch (err) {
    // A non-2xx response makes Flutterwave retry later.
    return errorResponse(err);
  }
});
