# Raffle ticket sales — Supabase setup

How a ticket sale works:

1. `raffle.html` calls the **create-ticket-order** function, which saves a
   `pending` order and works out the amount on the server.
2. The buyer pays in the Flutterwave popup, using that order's `tx_ref`.
3. The page calls **verify-ticket-payment**, which asks Flutterwave directly
   whether the payment succeeded. If it did, the order is marked `paid` and one
   serialised ticket (`RMC-0000001`, `RMC-0000002`, …) is issued per ticket bought.
4. **flutterwave-webhook** does the same check when Flutterwave notifies us, so
   tickets are still issued if the buyer closes the tab before step 3.
   Issuing is idempotent, so steps 3 and 4 never issue tickets twice.

`admin.html` reads the results. Only users listed in the `admins` table can
read any sales data; that's enforced by row level security in the database.

## One-time setup

Install the Supabase CLI, then from the project root:

```sh
supabase login
supabase init                 # only if supabase/config.toml doesn't exist yet
supabase link --project-ref YOUR-PROJECT-REF
supabase db push              # runs migrations/20261001000000_raffle_tickets.sql
```

### Secrets (server-side only, never in js/config.js)

From Flutterwave dashboard → Settings → API keys, and Settings → Webhooks
(make up a long random string for the secret hash and enter it in both places):

```sh
supabase secrets set FLW_SECRET_KEY=FLWSECK_TEST-xxxxxxxx-X
supabase secrets set FLW_WEBHOOK_HASH=some-long-random-string
```

`SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` are provided to functions automatically.

### Deploy the functions

They do their own validation, so they're deployed without Supabase's JWT check
(the webhook has to be, because Flutterwave can't send a Supabase token):

```sh
supabase functions deploy create-ticket-order --no-verify-jwt
supabase functions deploy verify-ticket-payment --no-verify-jwt
supabase functions deploy flutterwave-webhook --no-verify-jwt
```

Then in Flutterwave → Settings → Webhooks, set the URL to
`https://YOUR-PROJECT-REF.supabase.co/functions/v1/flutterwave-webhook`.

### Site config

Fill in `js/config.js` with the project URL, the **anon / publishable** key
(Project Settings → API), and the Flutterwave **public** key.

### Create an admin

The login form accepts a username or an email. A username without `@` is
signed in as `<username>@therealmccoy.admin`, so the default admin is:

| Username | Password   | Supabase email               |
|----------|------------|------------------------------|
| `admin`  | `admin123` | `admin@therealmccoy.admin`   |

1. Supabase dashboard → Authentication → Users → Add user → Create new user,
   with email `admin@therealmccoy.admin`, password `admin123`, and
   **Auto Confirm User** ticked (that address can't receive a confirmation email).
2. SQL editor:

   ```sql
   insert into public.admins (user_id)
   select id from auth.users where email = 'admin@therealmccoy.admin';
   ```

> **Change this password before ticket sales go live.** `admin123` is one of
> the first passwords anyone tries, and this account can read every buyer's
> name, email, and phone number. Change it under Authentication → Users →
> (the user) → Reset password / update. If leaked-password protection is
> enabled in Auth settings, Supabase will refuse `admin123` outright; use a
> stronger one.
>
> To add more admins, repeat the steps with another username (e.g.
> `christael@therealmccoy.admin`, signing in as `christael`) or a real email.

3. Turn off public sign-ups (Authentication → Sign In / Providers → "Allow new
   users to sign up"). Non-admins can't see any data even if they sign up, but
   there's no reason to let them create accounts.

The dashboard is at `/admin.html`. It isn't linked from the site and is marked
`noindex`, but the real protection is the database rules, not the hidden URL.

## Ticket confirmation emails (Brevo)

When tickets are issued (browser confirmation, webhook, or simulated
payment), the buyer is emailed their ticket codes, once per order. The
dashboard shows "Emailed", "Email failed" (hover for the reason), or
"Not emailed" for each paid order. A failed email never blocks the sale.

1. In Brevo: profile menu → SMTP & API → API Keys → Generate a new API key
   (it starts with `xkeysib-`).
2. Add a sender: Senders, Domains & Dedicated IPs → Senders → Add a sender,
   and confirm it from the verification email Brevo sends.
3. Save the settings in Supabase:

   ```sh
   supabase secrets set BREVO_API_KEY=xkeysib-xxxxxxxx
   supabase secrets set EMAIL_FROM_ADDRESS=tickets@yourdomain.com
   supabase secrets set EMAIL_FROM_NAME="The Real Mc'Coy Raffle"   # optional
   ```

For reliable delivery, send from an address on a domain you own and
authenticate that domain in Brevo (Senders, Domains & Dedicated IPs →
Domains). A Gmail sender works for testing, but inbox providers are more
likely to mark it as spam.

Without `BREVO_API_KEY` and `EMAIL_FROM_ADDRESS`, sales work exactly as
before and no emails are sent.

## Testing without Flutterwave (simulated payments)

With `PAYMENT_MODE = 'simulate'` in `js/config.js`, "Pay" opens a fake
checkout with a **Complete payment** button instead of Flutterwave. The order
is saved and real ticket codes are issued, flagged as test orders.

1. Run `migrations/20261001010000_simulated_payments.sql` (SQL Editor or `supabase db push`).
2. Turn simulation on and deploy the two functions it uses (no Flutterwave keys needed):

   ```sh
   supabase secrets set SIMULATE_PAYMENTS=true
   supabase functions deploy create-ticket-order --no-verify-jwt
   supabase functions deploy simulate-ticket-payment --no-verify-jwt
   ```

Clear test data before going live (the last line restarts numbering at
RMC-0000001, so only run it once no real tickets exist):

```sql
delete from public.tickets where order_id in (select id from public.ticket_orders where simulated);
delete from public.ticket_orders where simulated;
alter table public.tickets alter column serial restart with 1;
```

## Going live

- **Turn simulation off**: `supabase secrets unset SIMULATE_PAYMENTS`, set
  `PAYMENT_MODE = 'flutterwave'` in `js/config.js`, and optionally
  `supabase functions delete simulate-ticket-payment`. Changing the config
  alone isn't enough: while the secret is on, anyone could call the function
  directly and get free tickets.

- Swap the Flutterwave test keys for live keys (public key in `js/config.js`,
  secret key via `supabase secrets set`).
- Remove the "test mode" notices on `raffle.html`.
- Do a real ₦1,000 purchase end to end and check it appears on the dashboard
  with a ticket code.
