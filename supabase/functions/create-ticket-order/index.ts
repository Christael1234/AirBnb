// Creates a pending ticket order and returns the tx_ref to pay against.
// The amount is always calculated here, never taken from the browser.
import { corsHeaders, db, errorResponse, HttpError, json } from "../_shared/raffle.ts";

const TICKET_PRICE = 1000;
const MAX_PER_ORDER = 1000;

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  try {
    if (req.method !== "POST") throw new HttpError(405, "Method not allowed");
    const body = await req.json().catch(() => ({}));

    const name = String(body.name ?? "").trim();
    const email = String(body.email ?? "").trim().toLowerCase();
    const phone = String(body.phone ?? "").trim();
    const quantity = Number(body.quantity);

    if (!name || name.length > 200) throw new HttpError(400, "Please enter your full name.");
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length > 320) {
      throw new HttpError(400, "Please enter a valid email address.");
    }
    if (!/^[0-9+\s()-]{5,30}$/.test(phone)) throw new HttpError(400, "Please enter a valid phone number.");
    if (!Number.isInteger(quantity) || quantity < 1 || quantity > MAX_PER_ORDER) {
      throw new HttpError(400, `You can buy between 1 and ${MAX_PER_ORDER} tickets per order.`);
    }

    const tx_ref = `RAFFLE-${crypto.randomUUID()}`;
    const amount = quantity * TICKET_PRICE;

    const { error } = await db.from("ticket_orders").insert({
      tx_ref,
      buyer_name: name,
      buyer_email: email,
      buyer_phone: phone,
      quantity,
      amount_ngn: amount,
    });
    if (error) {
      console.error("insert ticket_orders failed", error);
      throw new HttpError(500, "We couldn't start your order. Please try again.");
    }

    return json({ tx_ref, amount, quantity });
  } catch (err) {
    return errorResponse(err);
  }
});
