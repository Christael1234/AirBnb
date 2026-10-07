// Called by the raffle page after Flutterwave checkout completes.
// Verifies the payment with Flutterwave and returns the issued ticket codes.
// Also used by the admin dashboard to recheck a pending order by tx_ref.
import { corsHeaders, errorResponse, HttpError, json, verifyAndIssueTickets } from "../_shared/raffle.ts";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  try {
    if (req.method !== "POST") throw new HttpError(405, "Method not allowed");
    const { tx_ref, transaction_id } = await req.json().catch(() => ({}));
    if (!tx_ref) throw new HttpError(400, "Missing payment reference.");

    // transaction_id comes from the checkout callback; without it (admin
    // recheck) the payment is looked up by tx_ref instead.
    return json(await verifyAndIssueTickets(transaction_id, String(tx_ref)));
  } catch (err) {
    return errorResponse(err);
  }
});
