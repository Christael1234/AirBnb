// Called by the raffle page after Flutterwave checkout completes.
// Verifies the payment with Flutterwave and returns the issued ticket codes.
import { corsHeaders, errorResponse, HttpError, json, verifyAndIssueTickets } from "../_shared/raffle.ts";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  try {
    if (req.method !== "POST") throw new HttpError(405, "Method not allowed");
    const { tx_ref, transaction_id } = await req.json().catch(() => ({}));
    if (!tx_ref || !transaction_id) throw new HttpError(400, "Missing payment reference.");

    return json(await verifyAndIssueTickets(transaction_id, String(tx_ref)));
  } catch (err) {
    return errorResponse(err);
  }
});
