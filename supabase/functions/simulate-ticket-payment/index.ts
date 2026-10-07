// Marks a pending order as paid WITHOUT taking a payment, for testing.
// Disabled unless the SIMULATE_PAYMENTS secret is "true" — unset it before
// going live, or anyone could issue themselves free tickets.
import { corsHeaders, db, errorResponse, HttpError, json, sendTicketEmail } from "../_shared/raffle.ts";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  try {
    if (Deno.env.get("SIMULATE_PAYMENTS") !== "true") {
      throw new HttpError(403, "Simulated payments are turned off.");
    }
    if (req.method !== "POST") throw new HttpError(405, "Method not allowed");
    const { tx_ref } = await req.json().catch(() => ({}));
    if (!tx_ref) throw new HttpError(400, "Missing order reference.");

    // Flag first, so the order is marked as a test before any tickets exist.
    const { data: order, error: flagError } = await db.from("ticket_orders")
      .update({ simulated: true })
      .eq("tx_ref", String(tx_ref))
      .eq("status", "pending")
      .select("amount_ngn")
      .maybeSingle();
    if (flagError) {
      console.error("flag simulated order failed", flagError);
      throw new HttpError(500, "We couldn't update this order.");
    }
    if (!order) throw new HttpError(404, "Order not found or already paid.");

    const { data, error } = await db.rpc("confirm_ticket_order", {
      p_tx_ref: String(tx_ref),
      p_flw_transaction_id: null,
      p_amount_paid: order.amount_ngn,
    });
    if (error) {
      console.error("confirm_ticket_order failed", tx_ref, error);
      throw new HttpError(409, "We couldn't issue tickets for this order.");
    }

    const tickets = (data as { ticket_code: string }[]).map((r) => r.ticket_code);
    await sendTicketEmail(String(tx_ref), tickets);
    return json({ tx_ref, simulated: true, tickets });
  } catch (err) {
    return errorResponse(err);
  }
});
